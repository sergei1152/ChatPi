var PublicChannel=require('../models/PublicChannel.js');
var logger=require('../logger.js');
var async=require('async');

module.exports=function(channel,socket,RedisClient){
  if(!channel.description){
    channel.description='';
  }
  var newChannel=new PublicChannel({
    name:channel.name,
    description: channel.description
  });
  //saving the brand new channel to the redis database
  RedisClient.set('channel:'+newChannel._id,JSON.stringify(newChannel),function(err){
    if(err){
      logger.error('There was an error in saving a new public channel to the mongo database',{error:err});
    }
    socket.emit("ChannelCreated",newChannel);
  });
};
