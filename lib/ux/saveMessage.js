//Saves a message to the redis database
var logger=require('../../logger');

module.exports=function(message,chatroomID,RedisClient){
  if(message.destination.type==='channel'){
    RedisClient.ChannelMessagesDB.LPUSH('channel:'+chatroomID,JSON.stringify(message),function(err) {
      if (err) {
        logger.error('There was an error in saving a message to the redis database',{channelID:chatroomID});
      }
      else{
        logger.debug('Saved message to public channel',{id:chatroomID});
      }
    });
  }
  else if (message.destination.type==='group'){

  }
};