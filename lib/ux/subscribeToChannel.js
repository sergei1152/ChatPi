/*This module handles channel subscriptions
First it checks that the specified channel actually exists in the redis database, and if it does,
it adds the channel to the socket for it to be later saved in the user object
*/

var logger=require('../../logger'); //for pretty console outputs

module.exports=function(socket, channel, RedisClientMainDB){
  //checking to see if the channel exists
  RedisClientMainDB.HEXISTS('channellist', channel.name.toLowerCase(),function(err, exists){
    if(!err && exists){
      socket.user_changes.changed=true;
      //only storing the name and the type as the description and _id are not necessary
      var newChannel={
        name:channel.name,
        type:channel.type
      };
      socket.user_changes.new_subscriptions.push(newChannel); //adding the channel to the socket to be saved later
    }
  });
};