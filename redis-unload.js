var PublicChannel=require('./models/PublicChannel.js');
var async=require('async');
var logger=require('./logger.js');

function saveChannelMongo(channel,callback){
  var tmpChannel=new PublicChannel();

  tmpChannel.name=channel.name;
  tmpChannel.description=channel.description;
  tmpChannel.chat_history=channel.chatHistory;
  tmpChannel.createdAt=channel.createdAt;

  tmpChannel.save(function(err){
    if (err){
      callback(err);
    }
    callback();
  });
}
module.exports=function(RedisClient,callback){
  //get all channels keys stored in redis database
  RedisClient.keys('channel:*',function(err,keys){
    if (err){
      logger.error('There was an error in retrieving the channels list from the redis database');
    }
    else{
      //get all the values of those keys
      RedisClient.mget(keys,function(err,channels){
        if (err){
          logger.error('There was an error in retrieving the channels list from the redis database');
        }
        //save all of the keys back to the mongo database
        async.each(channels, saveChannelMongo, function(err) {
          if (err) {
            logger.error('An error occurred dumping a channel from mongo to redis \n', {'error': err});
          }
          logger.info('Successfully dumped public channels to mongodb');
          callback(null);
        });
      });
    }
  });
};