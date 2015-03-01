//loading required modules
var mongoose = require('mongoose');

//Creating the schema for the user
var ChatRoom = mongoose.Schema({
  type: String, //can be public, private, or direct
  authorized_users: [String], //id of all users allowed to read from and post to the chat room. Can be "ALL" for public
  chat_history: [Message],
  description: [String],
  createdAt: Date,
  name: String //the name of the chatroom given by the user
  });

ChatRoom.methods.addMessageHistory=function(Message){
  this.chat_history.push(Message);
};

// create the model for users and expose it to the app
module.exports = mongoose.model('ChatRoom', ChatRoom);
