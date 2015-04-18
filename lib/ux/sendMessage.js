var Message = require('../../models/Message');
var logger = require('../../logger'); //for pretty console outputs

module.exports=function(socket, message, io, RedisClientChannelMessagesDB){ //TODO PRIVATE GROUP MESSAGE AUTHENTICATION
  //creating the message
  var newMessage = new Message();
  newMessage.senderUsername = socket.username;
  newMessage.senderName = socket.name;
  newMessage.contents = message.contents;
  newMessage.type = message.type;
  newMessage.dateSent = Date.now();
  newMessage.dateSentInMinutes = Math.ceil(newMessage.dateSent.getTime() / 1000 / 60);
  newMessage.senderProfilePicture = socket.profile_picture;
  newMessage.destination = message.destination._id;

  io.sockets.in(message.destination._id).emit('message', newMessage);
  require('./saveMessage')(newMessage,message.destination,RedisClientChannelMessagesDB); //saves the new message to the chat history for the room
  logger.debug('Sending message to ' + message.destination._id);
};