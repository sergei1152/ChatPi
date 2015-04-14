//Retrieves a user based on the username from the mongodb database, sends the metadata about the user to the client via socket io,
//and saves the user to the redis database for faster access next time
var logger=require('../logger');
var User=require('../models/User');
var saveUserSocket=require('./saveUserSocket');
var saveUserRedis=require('./saveUserRedis');

module.exports=function(RedisClientUserDB, username, socket,next) {
  User.findOne({ //look in mongodb for user with the id
    'username': username
  }, function (err, user) {
    if (err) {
      logger.error("Mongodb: There was an error accessing the mongodb database for a user...Denying access \n", {"error": err});
      next(new Error('Authentication error'));
    }
    //if the user was found in the database
    else if (user) {
      saveUserSocket(user, socket);
      saveUserRedis(user,RedisClientUserDB);
      next();
    }
    else {
      logger.warn('Mongo: A user tried to gain access to the app with a username that was not found in the database. Denying access..');
      next(new Error('Authentication error')); //if the user was not found in the user database
    }
  });
};