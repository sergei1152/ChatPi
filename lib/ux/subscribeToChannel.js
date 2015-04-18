//This module verifies and adds a channel to the user subscriptions
var logger=require('../../logger'); //for pretty console outputs

module.exports=function(socket, channel, RedisClientMainDB){
  RedisClientMainDB.HEXISTS('channellist', channel.name.toLowerCase(),function(err, exists){
    if(exists){
      socket.user_changes.changed=true;
      //only storing the name and the type as the description and _id are not necessary
      var newChannel={
        name:channel.name,
        type:channel.type
      };
      socket.user_changes.new_subscriptions.push(newChannel);
    }
  });
};