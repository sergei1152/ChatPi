//This file has to do with the socket.io handshake that occurs when a user tries to connect to the app
var logger = require('./logger'); //for pretty console outputs
var SERVER_SETTINGS = require("./config/server-config");
var User = require('./models/User');
var async = require('async');
var cookie = require('cookie'); //for parsing the cookie value from received cookies
var cookieParser = require('cookie-parser'); //used for decoding signed cookies

var saveUserSocket=require('./static/saveUserSocket');
var getUserMongo=require('./static/getUserMongo');
var saveUserChanges=require('./static/saveUserChanges');

module.exports = function(http, RedisClient) {
  //starting the socket server
  var io = require('socket.io')(http);

  var onlineUsers = 0; //to keep track of the online users

  //handshake stuff. Acts as middleware for when a user tries to connect to the socket.io server
  io.use(function(socket, next) {
    //parsing the sessionID cookie value sent by socket
    var sessionID = cookie.parse(socket.request.headers.cookie)[SERVER_SETTINGS.sessionIDName];

    //if the session id cookie exists
    if (sessionID) {
      //decodes the signed sessionID cookie
      sessionID = cookieParser.signedCookie(sessionID, SERVER_SETTINGS.sessionSecretKey);

      //check the redis database for the session cookie
      RedisClient.SessionDB.get("sessions:" + sessionID, function(err, session) {

        if (err) { //if an error occurred retrieving the session from the db
          logger.error("Redis: An error occurred accessing the redis database to retrieve a session \n", {error: err});
          next(new Error('Authentication error'));
        }
        else if (session && JSON.parse(session).passport.user) {//if the session was found in the redis database, and the session is initialized
          var username=JSON.parse(session).passport.user;
          //check the redis database for the user with the username (for fast access, otherwise use mongodb)
          var query=[
            'user:'+username,
            '_id',
            'username',
            'name',
            'profile_picture',
            'online_status',
            'subscribed_public_channels',
            'private_groups',
            'contacts'
          ];
          RedisClient.UserDB.HMGET(query, function(err, result) {
            if (err) { //if some kind of error occurred, look in the mongo database instead
              logger.error("Redis: There was an error in looking up a user in the redis database...using mongodb instead \n",{error:err});
              getUserMongo(RedisClient.UserDB,username,socket,next);
            }
            else if (result[0]) { //if the user was found in the redis database
              var currentUser = {
                _id:result[0],
                username: result[1],
                name: result[2],
                profile_picture:result[3],
                online_status: result[4],
                subscribed_public_channels:result[5],
                private_groups:result[6],
                contacts:result[7]
              };
              logger.debug('Redis: User '+currentUser.username+ ' found. Allowing connection and sending metadata to client...');
              saveUserSocket(currentUser,socket); //saves user data to the socket session
              next();
            }
            else if (!user) { //if the user was not found in the database (ie not saved to the redis database yet, look up the mongodb)
              logger.debug('Redis: User was not found in the redis database...using mongodb instead');
              getUserMongo(RedisClient.UserDB,username,socket,next);
            }
          });
        }
        else {//if the session was not found in the redis database
          logger.warn("Redis: A user tried to join the chat with a session that was not found in the redis database. Denying access to the socket server...");
          next(new Error('Authentication error'));
        }
      });
    }
    else {//if the user did not send back any session cookies
      logger.warn("Redis: A user tried to join the chatroom without any cookies set. Denying access to the socket server...");
      next(new Error('Authentication error'));
    }
  });

  //after the socket passes the handshake
  io.on('connection', function(socket) {
    onlineUsers++; //adding the number of users to the counter
    logger.info('Online Users: ' + onlineUsers);

    require('./socket-ux.js')(io,socket,RedisClient);
    //executes when a user disconnects
    socket.on('disconnect', function() {
      onlineUsers--;
      logger.info('Online Users: ' + onlineUsers);
      if (socket.user_changes.changed === true) { //if a user made a change to the profile
        saveUserChanges(socket,RedisClient.UserDB);
      }
    });
  });
};