//Subscribes the socket to a specific channel and sends it back the room chat history
var logger = require('../../logger'); //for pretty console outputs

module.exports=function(socket, room, RedisClient){
  RedisClient.MainDB.HGET('channellist',room.name.toLowerCase(),function(err,result){
    if(!err){
      if(result) { //if the channel was found
        var channel = JSON.parse(result);
        RedisClient.ChannelMessagesDB.LRANGE("channel:" + channel._id, 0, 24, function (err, messages) {
          if (!err) {
            channel = {
              _id: channel._id,
              description: channel.description,
              name: channel.name,
              chat_history: messages
            };
            socket.emit('roomJoined', channel);
            socket.join(channel._id);
            logger.debug(socket.username + " has joined the channel " + channel.name);
          }
        });
      }
    }
  });
};
