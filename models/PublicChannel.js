//loading required modules
var mongoose = require('mongoose');
var Message=require('./Message.js'); //the Message schema

//Creating the schema for the user
var PublicChannel = new mongoose.Schema({
  chat_history: [Message],
  description: String, //description of the public channel
  createdAt: Date,
  name: String //name of the public channel
});

PublicChannel.methods.addMessageHistory=function(Message) {
  this.chat_history.push(Message);
};

PublicChannel.methods.update=function(newChannel,callback){
  if(this.description!==newChannel.description){
    this.name=newChannel.description;
    this.save(function(err){
      if(err){
        logger.error('There was an error in updating a public channel to the mongo database');
      }
    });
  }
  //if(newChannel.chatHistory[newChannel.chatHistory.length-1].dateSentInMinutes>this.chatHistory[this.chatHistory.length-1].dateSentInMinutes){
  //  //should change the message history here
  //}
  if(callback){
    callback();
  }
};

// create the model for users and expose it to the app
module.exports = mongoose.model('PublicChannel', PublicChannel);



