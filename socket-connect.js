//This file has everything to do with the initial connection socket io stuff

var logger = require('./logger.js'); //for pretty console outputs

var SERVER_SETTINGS = require("./config/server-config.js");

//custom objects
var ChatRoom = require('./models/ChatRoom.js');
var User = require('./models/User.js');
var async = require('async');
var cookie = require('cookie'); //for parsing the cookie value from received cookies
var cookieParser = require('cookie-parser'); //used for decoding signed cookies
var publicChannelList;

//retrieves the list of public channels from the mongodb database and loads into memory
async.series([

        function(callback) {
            require('./static/retrieve.js').getPublicChannels(callback);
        }
    ],
    // callback when the retrieval from the database is finished
    function(err, results) {
        if (err) {
            logger.error('An error occured retrieving the list of public channels from the mongodb database \n %j', {
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
                    logger.warn("A user tried to access the chat with a session ID that was not found in the session database \n" + err);
                    next(new Error('Authentication error'));
                }
                //if the session was found in the redis database
                else if (session) {
                  //check the redis database for the user
                  RedisClient.get("user:" + JSON.parse(session).passport.user, function(err, user) {

                    if (err) { //if the session was not found in the database
                      logger.warn("Could not find the user in the redis database \n" + err);
                      next(new Error('Authentication error'));
                    }
                    if (user) { //if the user was found in the redis database
                      var currentUser = JSON.parse(user);
                      logger.debug('User found in the redis database \n %j',{'user':user},{});
                      //setting properties about the socket
                      socket.name = user.name;
                      socket.username = user.username;
                      socket.profile_picture = user.profile_picture;
                      socket.authorized = true;
                      socket.newPublicChannels = [];
                      //sends the user his name and username for CSS purposes only
                      socket.emit("metadata", {
                        clientName: user.name,
                        clientUsername: user.username,
                        clientProfilePic: user.profile_picture,
                        clientOnlineStatus: user.onlineStatus,
                        subscribed_channels: user.subscribed_public_channels,
                        private_groups: user.private_groups,
                        contacts: user.contacts
                      });
                      logger.info("User " + user.name + " successfully connected to the chat");
                    }
                    if (!user) { //if the user was not found in the database (ie not saved to the redis database yet, look up the mongo)
                      //looks in the mongodb database for the id
                      logger.debug('User was not found in the redis database...accessing mongodb');
                      User.findOne({
                        '_id': JSON.parse(session).passport.user
                      }, function (err, user) {
                        //if the id was not found in the monggo database
                        if (err) {
                          logger.error("A user tried to access the chat with an ID that is no longer in the database \n %j", {
                            "error": err
                          }, {});
                          next(new Error('Authentication error'));
                        }
                        //if the user was found in the database
                        else if (user) {
                          //setting properties about the socket
                          socket.name = user.name;
                          socket.username = user.username;
                          socket.profile_picture = user.profile_picture;
                          socket.authorized = true;
                          socket.newPublicChannels = [];
                          //sends the user his name and username for CSS purposes only
                          socket.emit("metadata", {
                            clientName: user.name,
                            clientUsername: user.username,
                            clientProfilePic: user.profile_picture,
                            clientOnlineStatus: user.onlineStatus,
                            subscribed_channels: user.subscribed_public_channels,
                            private_groups: user.private_groups,
                            contacts: user.contacts
                          });
                          logger.info("User " + user.name + " successfully connected to the chat");

                          //Saves the user to the redis database for faster access next time
                          RedisClient.set('user:' + user._id, JSON.stringify({
                            name: user.name,
                            username: user.username,
                            profile_picture: user.profile_picture,
                            online_status: 'Online',
                            subscribed_channels: user.subscribed_public_channels,
                            private_groups: user.private_groups,
                            contacts: user.contacts
                          }), function (err) {
                            if (err) {
                              logger.error('There was an error in saving a user to the redis database \n %j', {'error': error}, {});
                            }
                          });
                          RedisClient.expire('user:' + user._id, SERVER_SETTINGS.userTTL);
                          next();
                        }
                      });
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