var async=require('async');
var logger=require('../logger.js');

function saveUserChannel(currentUser,channel,callback){
  currentUser.subscribed_public_channels.push(channel);
  callback();
}

module.exports=function(socket,RedisClient){
  //check the redis database for the user with the id
  RedisClient.get("user:" + socket.userId, function(err, user) {
    if (err) { //if some kind of error occurred, look in the mongo database instead
      logger.error("There was an error in looking up a user in the redis database for a user after a disconnect. \n",{error:err});
    }
    else if (user) { //if the user was found in the redis database
      var currentUser = JSON.parse(user);
      if(socket.userChanges.newSubscriptions.length>0){
        async.each(socket.userChanges.newSubscriptions, saveUserChannel.bind(null,currentUser), function(err) {
          if (err) {
            logger.error('An error occurred saving a channel to the redis database \n', {'error': err});
          }
          RedisClient.set("user:" + socket.userId,JSON.stringify(currentUser),function(err){
            logger.debug('Successfully saved user changes to the redis database');
          });
        });
      }
    }
    else{
      logger.warn('A user\'s changes were lost because the user could not be accessed in the redis database\n',{userID:socket.userId});
    }
  });
};