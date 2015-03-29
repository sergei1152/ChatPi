var logger=require('../logger.js');

module.exports=function(message,chatroom,RedisClient){
  //make sure that the channel exists first
  RedisClient.exists('channel:'+chatroom._id,function(err,exists) {
    if (err) {
      logger.error('There was an error in retrieving the channels list from the redis database');
    }
    else if(exists){
      RedisClient.get('channel:'+chatroom._id,function(err, channel){
        if(err){
          logger.error('There was an error in retrieving the channels list from the redis database');
        }
        else if(channel){
          channel=JSON.parse(channel);
          channel.chat_history.push(message);
          RedisClient.set('channel:'+chatroom._id,JSON.stringify(channel),function(err) {
            if (err) {
              logger.error('There was an error in saving a message to the redis database for chatroom\n', {'channel':channel});
            }
          });
        }
      });
    }
  });
};