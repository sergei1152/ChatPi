var PublicChannel=require('../models/PublicChannel.js');
var logger=require('../logger.js');
var async=require('async');
var validator=require('./validator.js');

module.exports=function(channel,socket,RedisClientMainDB){
  if (validator.validatePublicChannelName(channel.name)){
    if(!channel.description){
      channel.description='';
    }
    var newChannel=new PublicChannel({
      name:channel.name,
      description: channel.description
    });
    //Saves the channel to the redis database, if the field  does not exist yet
    RedisClientMainDB.HSETNX("channellist",newChannel.name.toLowerCase(),JSON.stringify(newChannel),function(err,saved){
      if(err){
        logger.error('There was an error in saving a new public channel to the Redis database',{error:err});
      }
      if (saved){
        logger.info("A user created a new public channel.",{newchannelname:channel.name,username:socket.username});
        socket.emit("ChannelCreated",newChannel);
      }
      else{
        logger.debug("A user tried to create a channel that already exists in the redis database");
      }
    });
  }
};
