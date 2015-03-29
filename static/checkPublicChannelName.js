var async=require('async');
var logger=require('../logger.js');

function checkName(name,channel,callback){
  if(name===JSON.parse(channel).name){
    callback(true);
  }
  else{
    callback(false);
  }
}

module.exports=function(name,RedisClient,callback){
  name=name.toLowerCase();

  //get all channels keys stored in redis database
  RedisClient.keys('channel:*',function(err,keys) {
    if (err) {
      logger.error('There was an error in retrieving the channels list from the redis database');
      callback(null,false);
    }
    else {
      //get all the values of those keys
      RedisClient.mget(keys, function (err, channels) {
        if (err) {
          logger.warn('No channels found to compare channel names to. Proceeding...');
          callback(null,false);
        }
        if (channels) {
          //save all of the keys back to the mongo database
          async.some(channels, checkName.bind(null, name), function (result) {
            if (result) { //an existing name was found
              callback(null,true);
            }
            else { //no name was found
              callback(null,false);
            }
          });
        }
      });
    }
  });
};