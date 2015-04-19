//sends a message to everyone in the specified destination chat room, checking that it exists first
var Message = require('../../models/Message');
var logger = require('../../logger'); //for pretty console outputs

module.exports=function(socket, message, io, RedisClient){
  if(message.destination.type==='channel'){
    //make sure the destination channel exists, and if so, emit the message to all the connected sockets
    RedisClient.MainDB.HGET('channellist',message.destination.name.toLowerCase(),function(err, channel){
      if(!err && channel){
        channel=JSON.parse(channel);
        //creating the message
        var newMessage = new Message({
          senderUsername: socket.username,
          senderName: socket.name,
          contents: message.contents,
          type: message.type,
          senderProfilePicture: socket.profile_picture,
          destination:message.destination
        });
        io.sockets.in(channel._id).emit('message', newMessage);
        logger.debug('User '+socket.username+" sent a message to public channel "+message.destination.name);
        require('./saveMessage')(newMessage,channel._id,RedisClient);
      }
    });
  }
  else if (message.destination.type==='group'){

  }
};