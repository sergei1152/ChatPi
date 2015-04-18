//Creates a new public channel in the redis database
var logger=require('../../logger.js');
var async=require('async');
var validator=require('./../validator.js');
var PublicChannel=require('../../models/PublicChannel.js');

module.exports=function(socket,channel,RedisClientMainDB){
  if (validator.validatePublicChannelName(channel.name)){
    if(!channel.description){
      channel.description='';
    }
    var newChannel=new PublicChannel({
      name:channel.name,
      description: channel.description
    });
    //Saves the channel to the redis database, only if the field  does not exist yet
    RedisClientMainDB.HSETNX("channellist",newChannel.name.toLowerCase(),JSON.stringify(newChannel),function(err,saved){
      if(err){
        logger.error('There was an error in saving a new public channel to the Redis database',{error:err});
      }
      if (saved){
        logger.info("A user created a new public channel.",{newchannelname:channel.name,username:socket.username});
        socket.emit("ChannelCreated",newChannel); //only sending the client back the name and the description of the new channel
      }
      else{ //if the channel name already exists
        socket.emit("ChannelCreated",false);
        logger.debug("A user tried to create a channel that already exists in the redis database");
      }
    });
  }
  else{ //if the name was not valid
    socket.emit("ChannelCreated",false);
    logger.debug("A user tried to create a channel with an invalid channel name");
  }
};
