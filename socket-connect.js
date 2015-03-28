//This file has everything to do with the initial connection socket io stuff

var logger = require('./logger.js'); //for pretty console outputs

var SERVER_SETTINGS = require("./config/server-config.js");

//custom objects
var User = require('./models/User.js');
var async = require('async');
var cookie = require('cookie'); //for parsing the cookie value from received cookies
var cookieParser = require('cookie-parser'); //used for decoding signed cookies
var publicChannelList;
var saveUserSocket=require('./static/saveUserSocket.js');
var saveUserMongo=require('./static/findUserMongo.js');
//retrieves the list of public channels from the mongodb database and loads into memory
async.series([

    function(callback) {
      require('./static/retrieve.js').getPublicChannels(callback);
    }
  ],
  // callback when the retrieval from the database is finished
  function(err, results) {
    if (err) {
      logger.error('An error occurred retrieving the list of public channels from the mongodb database \n %j', {
        'error': err
      }, {});
      publicChannelList = null;
    } else {
      publicChannelList = results[0];
    }
  });

module.exports = function(http, RedisClient) {
  //starting the socket server
  var io = require('socket.io')(http);

  var onlineUsers = 0; //to keep track of the online users

  //handshake stuff for when a user tries to connect to the socket server
  io.use(function(socket, next) {
    //parsing the sessionID cookie value sent by socket
    var sessionID = cookie.parse(socket.request.headers.cookie)[SERVER_SETTINGS.sessionIDName];

    //if the session id cookie exists
    if (sessionID) {
      //decodes the signed sessionID cookie
      sessionID = cookieParser.signedCookie(sessionID, SERVER_SETTINGS.sessionKey);

      //check the redis database for the session cookie
      RedisClient.get("sessions:" + sessionID, function(err, session) {

        if (err) { //if the session was not found in the database
          logger.error("An error occurred accessing the redis database for sessions \n", {error: err});
          next(new Error('Authentication error'));
        }
        else if (session && JSON.parse(session).passport.user) {//if the session was found in the redis database
          var userID=JSON.parse(session).passport.user;
          //check the redis database for the user with the id
          RedisClient.get("user:" + userID, function(err, user) {

            if (err) { //if some kind of error occurred, look in the mongo database instead
              logger.error("There was an error in looking up a user in the redis database...using mongo instead \n",{error:err});
              saveUserMongo(RedisClient,userID,socket,next);
            }
            else if (user) { //if the user was found in the redis database
              var currentUser = JSON.parse(user);
              logger.debug('User found in the redis database \n',{user:currentUser});
              saveUserSocket(socket,currentUser);
              next();
            }
            else if (!user) { //if the user was not found in the database (ie not saved to the redis database yet, look up the mongodb)
              logger.debug('User was not found in the redis database...accessing mongodb');
              saveUserMongo(RedisClient,userID,socket,next);
            }
          });
        }
        //if the session was not found in the redis database
        else {
          logger.warn("A user tried to join the chat with a session that was not found in the redis database");
          next(new Error('Authentication error'));
        }
      });
    }
    //if the user did not send back any session cookies
    else {
      logger.warn("A user tried to join the chatroom without any cookies set");
      next(new Error('Authentication error'));
    }
  });

  //after the socket passes the handshake
  io.on('connection', function(socket) {
    onlineUsers++; //adding the number of users to the counter
    logger.info('Online Users: ' + onlineUsers);

    require('./socket-ux.js')(io,socket,publicChannelList);
    //executes when a user disconnects
    socket.on('disconnect', function() {
      onlineUsers--;
      logger.info('Online Users: ' + onlineUsers);
      if (socket.newPublicChannels.length > 0) {
        User.findOne({
          'username': socket.username
        }, function(err, result) {
          //if the id was not found in the monggo database
          if (err) {
            logger.error("There was an error in saving the users credentials after a disconnect \n %j", {
              "error": err
            }, {});
          }
          //if the user was found in the database
          else if (result) {
            for (var i = 0; i < socket.newPublicChannels.length; i++) {
              result.subscribed_public_channels.push(socket.newPublicChannels[i]);
            }
            //NOTE: validate this input
            result.save(function(err) {
              if (err) {
                logger.error('There was an error in saving a users credentials to the database after a disconnect \n %j', {
                  'error': err
                }, {});
              }
            });
          }
        });
      }
    });

  });
};