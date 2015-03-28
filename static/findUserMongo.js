//This module is intended for retrieving a user based on the user id and saving it to the redis database
var logger=require('../logger.js');
var User=require('../models/User.js');
var saveUserSocket=require('./saveUserSocket.js');
var SERVER_SETTINGS=require('../config/server-config.js');

module.exports=function(RedisClient, userID, socket,next) {
  User.findOne({ //look in mongodb for user with the id
    '_id': userID
  }, function (err, user) {
    if (err) {
      logger.error("There was an error accessing the mongodb database for users \n", {"error": err});
      next(new Error('Authentication error'));
    }
    //if the user was found in the database
    else if (user) {
      saveUserSocket(socket, user);

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
          logger.error('There was an error in saving a user to the redis database \n',{'error': error});
        }
        RedisClient.expire('user:' + user._id, SERVER_SETTINGS.userTTL);
      });
      next();
    }
    else {
      next(new Error('Authentication error')); //if the user was not found in the user database
      logger.warn('A user with an empty or fake session id tried to access the application');
    }
  });
};