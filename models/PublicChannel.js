//loading required modules
var mongoose = require('mongoose');
var Message=require('./Message.js'); //the Message schema

//Creating the schema for the user
var PublicChannel = new mongoose.Schema({
  name: {
    type:String,
    unique: true,
    required: true
  },
  description:{
    type:String,
    default: ''
  }, //description of the public channel
  createdAt: {
    type:Date,
    default: Date.now
  },
  chat_history: {
    type:[Message],
    default:[]
  }
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



