//loading required modules
var mongoose = require('mongoose');
var Message=require('./Message.js'); //the Message schema

//Creating the schema for the user
var PublicChannel = mongoose.Schema({
  chat_history: [Message],
  description: [String], //description of the public channel
  createdAt: Date,
  name: String //name of the public channel
  });

  PublicChannel.methods.addMessageHistory=function(Message){
  this.chat_history.push(Message);
};

// create the model for users and expose it to the app
module.exports = mongoose.model('PublicChannel', PublicChannel);
