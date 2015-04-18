//This module loads everything that is to be cached in to the redis database

var PublicChannel = require('./../../models/PublicChannel.js'); //mongoose public channel model
var logger=require('./../../logger.js'); //for pretty console outputs
var async=require('async');
var SERVER_SETTINGS=require('./../../config/server-config.js');

function loadPublicChannel(RedisClient,channel,callback){
  channel.chat_history.splice(0,channel.chat_history.length-1-SERVER_SETTINGS.numMessageToStore);

  RedisClient.set('channel:'+channel._id,JSON.stringify(channel),function(err){
    if(err) {
      callback(err);
    }
    callback(null);
  });
}

module.exports=function(RedisClient,callback){
  logger.info('Retrieving list of public channels from the mongo database...');
  //finds all the public channels in the mongo database
  PublicChannel.find({}, function(err, list) {
    // if there are any errors, return the error
    if (err) {
      logger.error("An error occurred while retrieving public channels from the mongo database\n",{'error': err});
    }
    logger.info('Retrieved list of public channels from mongo...transferring to redis');
    if(list){
      async.each(list, loadPublicChannel.bind(null,RedisClient), function(err) {
        if (err) {
          logger.error('An error occurred saving a channel to the redis database \n', {'error': err});
        }
        logger.info('Successfully transferred public channels to redis');
        callback(null);
      });
    }
    else{
      logger.warn('No channels found in the mongo database, proceeding');
      callback(null);
    }
  });
};