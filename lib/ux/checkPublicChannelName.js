//Checks the redis database to determine whether a channel name exists. This search is be case insensitive!
var logger=require('../../logger.js');
var validator=require('./../validator');

module.exports=function(socket,name,RedisClientMainDB){
  if(validator.validatePublicChannelName(name)) {
    name = name.toLowerCase(); //converting to lowercase
    //checking the channellist hash for a key with the channel name
    RedisClientMainDB.HEXISTS('channellist', name, function (err, exists) {
      if (err) {
        logger.error('There was an error in retrieving the channels list from the redis database');
        socket.emit("PublicChannelNameStatus","Something went wrong :(");
      }
      else if (!exists) { //the channel does not exist and the name is available
        socket.emit("PublicChannelNameStatus","Available!");
      }
      else {
        socket.emit("PublicChannelNameStatus","Taken!");
      }
    });
  }
  else{ //if the name did not pass validation
    socket.emit("PublicChannelNameStatus","Invalid Channel Name!");
  }
};