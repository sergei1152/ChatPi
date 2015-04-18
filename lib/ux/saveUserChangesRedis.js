//This module has to do with saving the new user changes (from socket) back to the redis database.
// Currently this occurs after every user disconnect.
//So far only tracks new subscriptions of public channels
var logger=require('../../logger.js');

module.exports=function(socket,RedisClientUserDB){
  //The items that the user is able to modify during the session
  var query=[
    'user:'+socket.username,
    'password',
    'name',
    'profile_picture',
    'subscribed_public_channels',
    'private_groups',
    'contacts'
  ];

  RedisClientUserDB.HMGET(query, function(err, result) {
    if (err) {
      logger.error("Redis: Could not retrieve user data from the database. Unable to save to redis. \n",{error:err});
    }
    else if (result[0]) { //if the user was found in the redis database
      var changedQuery=['user:'+socket.username];

      //checking for new subscriptions
      if(socket.userChanges.new_subscriptions.length>0){
        changedQuery.push('subscribed_public_channels');
        var new_subscribed_channels_list=JSON.parse(result[3]).concat(socket.new_subscriptions);
        chnagedQuery.push(new_subscribed_channels_list.toString());
      }

      RedisClientUserDB.HMSET(changedQuery,function(err){
        if(err){
          logger.error('Redis: There was an error in saving user changes to the redis.',{error:err});
        }
      });

    }
    else{ //if the user was not found in the redis database
      logger.warn('Redis: A user\'s changes were lost because the user could not be found in the database\n',{username:username});
    }
  });
};