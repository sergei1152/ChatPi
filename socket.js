//This file has everything to do with the actual server-side socket.io stuff

var logger = require('./logger.js'); //for pretty console outputs

var SERVER_SETTINGS = require("./config/server-config.js");

//custom objects
var ChatRoom = require('./models/ChatRoom.js');
var User = require('./models/User.js');
var Message = require('./models/Message.js');

var cookie = require('cookie'); //for parsing the cookie value from received cookies
var cookieParser = require('cookie-parser'); //used for decoding signed cookies

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
      RedisClient.get("sessions:" + sessionID, function(err, reply) {

        if (err) { //if the session was not found in the database
          logger.warn("A user tried to access the chat with a session ID that was not found in the session database \n" + err);
          next(new Error('Authentication error'));
        }
        //if the session was found in the redis database
        else if (reply) {
          //looks in the mongodb database for the id
          User.findOne({
            '_id': JSON.parse(reply).passport.user
          }, function(err, result) {
            //if the id was not found in the monggo database
            if (err) {
              logger.error("A user tried to access the chat with an ID that is no longer in the database \n %j", {
                "error": err
              }, {});
              next(new Error('Authentication error'));
            }
            //if the user was found in the database
            else if (result) {
              //setting properties about the socket
              socket.name = result.name;
              socket.username = result.username;
              socket.profile_picture=result.profile_picture;
              socket.authorized = true;
              //sends the user his name and username for CSS purposes only
              socket.emit("metadata", {
                clientName: result.name,
                clientUsername: result.username,
                clientProfilePic: result.profile_picture,
                clientOnlineStatus: result.onlineStatus,
                publicChannels: result.subscibed_public_channels,
                privateGroups: result.private_groups,
                contacts: result.contacts
              });
              logger.info("User " + result.name + " successfully connected to the chat");
              next();
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
    //if the user did not send back any cookies
    else {
      logger.warn("A user tried to join the chatroom without any cookies set");
      next(new Error('Authentication error'));
    }
  });

  //after the socket passes the handshake
  io.on('connection', function(socket) {
    onlineUsers++; //adding the number of users to the counter
    logger.info('Online Users: ' + onlineUsers);

    //When a new chat message has been received
    socket.on('message', function(data) {
      if (socket.authorized) { //makes sure that the socket handshake was successfull
        //creating the message
        var newMessage = new Message();
        newMessage.senderUsername = socket.username;
        newMessage.senderName = socket.name;
        newMessage.contents = data.contents;
        newMessage.type = data.type;
        newMessage.dateSent = Date.now();
        newMessage.dateSentInMinutes = Math.ceil(newMessage.dateSent.getTime() / 1000 / 60);
        newMessage.senderProfilePicture=socket.profile_picture;
        //will send to the buffer in this line, before setting the profile picture
        io.emit('message', newMessage);
      }
    });
    //executes when a user disconnects
    socket.on('disconnect', function() {
      onlineUsers--;
      logger.info('Online Users: ' + onlineUsers);
    });
  });
};
