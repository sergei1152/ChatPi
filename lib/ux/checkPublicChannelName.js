//Checks the redis database to determine whether a channel name exists. This search will be case insensitive!
var logger=require('../../logger.js');

module.exports=function(name,RedisClientMainDB,callback){
  name=name.toLowerCase(); //converting to lowercase
  //checking the channellist hash for a key with the channel name
  RedisClientMainDB.HGET('channellist',name,function(err,exists) {
    if (err) {
      logger.error('There was an error in retrieving the channels list from the redis database');
      callback(null,false);
    }
    else if(!exists) { //the channel does not exist and the name is available
      callback(null, false);
    }
    else{
      callback(null, true);
    }
  });
};