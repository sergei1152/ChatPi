var ChatRoom = require('./models/ChatRoom.js');
var User = require('./models/User.js');
var Message = require('./models/Message.js');
var logger = require('./logger.js');

var cookie = require('cookie');
var cookieParser = require('cookie-parser'); //used for decoding signed cookies
var SERVER_SETTINGS = require("./config/server-config.js");
module.exports = function(http, RedisClient) {
  var io = require('socket.io')(http);

  //Creating the chatroom object
  var chat = new ChatRoom();
  var onlineUsers = 0;

  //handshake stuff for when a user tries to connect to the server
  io.use(function(socket, next) {
    //if the socket is already authorized
    if (socket.authorized) {
      next();
    }
    //if it's the first time that the socket is connecting
    else {
      //getting the sesisonID cookie from the socket
      var sessionID = cookie.parse(socket.request.headers.cookie)[SERVER_SETTINGS.sessionIDName];
      sessionID=cookieParser.signedCookie(sessionID,SERVER_SETTINGS.sessionKey);
      //if the session id cookie was exists
      if (sessionID) {
        RedisClient.get("sessions:" + sessionID, function(err, reply) {
          //if the session was not found in the database
          if (err) {
            logger.warn("A user tried to access the chat with a session ID that was not found in the session database \n" + err);
            next(new Error('Authentication error'));
          }
          //if the session was found in the redis database
          else if (reply) {
            //looks in the mongodb database for the id
            User.findOne({
              '_id': JSON.parse(reply).passport.user
            }, function(err, result) {
              //if the id was not found in the database
              if (err) {
                logger.error("A user tried to access the chat with an ID that is no longer in the database");
                next(new Error('Authentication error'));
              }
              //if the user was found in the database
              else {
                //setting properties about the socket
                socket.name = result.name;
                socket.username = result.username;
                socket.authorized = true;
                //sends the user his name and username for CSS purposes only
                socket.emit("credentials", {
                  name: result.name,
                  username: result.username
                });
                logger.debug("User successfully connected");
                next();
              }
            });
          }
          //if the session was not found in the redis database
          else{
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
    }
  });

  io.on('connection', function(socket) {
    onlineUsers++; //adding the number of users to the counter
    logger.info('Online Users: ' + onlineUsers);

    //When a new chat message has been received
    socket.on('message', function(data) {
      if (socket.authorized) {
        var newMessage = new Message();
        newMessage.senderUsername = socket.username;
        newMessage.senderName = socket.name;
        newMessage.contents = data.contents;
        newMessage.type = data.type;
        newMessage.dateSent = Date.now();
        newMessage.dateSentInMinutes = Math.ceil(newMessage.dateSent.getTime() / 1000 / 60);
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
