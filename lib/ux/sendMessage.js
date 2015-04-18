var Message = require('../../models/Message');
var logger = require('../../logger'); //for pretty console outputs

module.exports=function(socket, message, io, RedisClientMainDB){
  //creating the message
  var newMessage = new Message();
  newMessage.senderUsername = socket.username;
  newMessage.senderName = socket.name;
  newMessage.contents = message.contents;
  newMessage.type = message.type;
  newMessage.dateSent = message.now();
  newMessage.dateSentInMinutes = Math.ceil(newMessage.dateSent.getTime() / 1000 / 60);
  newMessage.senderProfilePicture = socket.profile_picture;
  newMessage.destination = message.destination._id;

  io.sockets.in(data.destination._id).emit('message', newMessage);
  require('./saveMessage')(newMessage,data.destination,RedisClientMainDB.ChannelMessagesDB); //saves the new message to the chat history for the room
  logger.debug('Sending message to ' + data.destination._id);
};