//Subscribes the socket to a specific channel and sends it back the room meta information and chat history
var logger = require('../../logger'); //for pretty console outputs

module.exports=function(socket, room, RedisClient){
  if (room.type='channel'){
    RedisClient.MainDB.HGET('channellist',room.name.toLowerCase(),function(err,result){
        if(!err && result) { //if the channel was found
          result=JSON.parse(result);
          var channel = {
            description: result.description,
            name: result.name,
            type: result.type
          };
          //get the last 25 messages from the channel and send to client
          RedisClient.ChannelMessagesDB.LRANGE("channel:" + result._id, 0, 24, function (err, messages) {
            if (!err && messages) {
              channel.chat_history=messages;
              socket.emit('roomJoined', channel);
              socket.join(result._id);
              logger.debug(socket.username + " has joined the channel " + channel.name);
            }
            else{ //if there was no channel history
              socket.join(result._id);
              socket.emit('roomJoined', channel);
            }
          });
        }
        else{
          logger.error('There was an error in retrieving metadata about a channel:\n',{name: room.name, type: room.type});
          socket.emit('roomJoined', false);
        }
    });
  }
  else if (room.type="group"){

  }
};
