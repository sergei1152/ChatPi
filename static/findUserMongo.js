//This module is intended for retrieving a user based on the user id and saving it to the redis database
var logger=require('../logger.js');
var User=require('../models/User.js');
var saveUserSocket=require('./saveUserSocket.js');
var saveUserRedis=require('./saveUserRedis.js');
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
      saveUserRedis(user,RedisClient);
      next();
    }
    else {
      next(new Error('Authentication error')); //if the user was not found in the user database
      logger.warn('A user with an empty or fake session id tried to access the application');
    }
  });
};