//This module loads everything that is to be cached in to the redis database

var PublicChannel = require('./models/PublicChannel.js'); //mongoose public channel model
var logger=require('./logger.js'); //for pretty console outputs
var async=require('async');

function loadPublicChannel(RedisClient,item,callback){
  RedisClient.set('channel:'+item._id,JSON.stringify(item),function(err){
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

    async.each(list, loadPublicChannel.bind(null,RedisClient), function(err) {
      if (err) {
        logger.error('An error occurred saving a channel to the redis database \n', {'error': err});
      }
      logger.info('Successfully transferred public channels to redis');
      callback(null);
    });
  });
};