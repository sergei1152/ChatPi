//Saves a message to the redis database
var logger=require('../../logger');

module.exports=function(message,chatroom,RedisClientChannelMessagesDB){
  RedisClientChannelMessagesDB.LPUSH('channel:'+chatroom._id,JSON.stringify(message),function(err) {
    if (err) {
      logger.error('There was an error in saving a message to the redis database',{channelname:channel.name});
    }
  });
};