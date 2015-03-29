//loading required modules
var mongoose = require('mongoose');
var Message=require('./Message.js'); //the Message schema

var async=require('async');
var SERVER_SETTINGS=require('../config/server-config.js');

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
  }
  //if new messages have been saved to the chat history
  if(newChannel.chat_history.length>SERVER_SETTINGS.numMessageToStore){
    newChannel.chat_history.splice(0,SERVER_SETTINGS.numMessageToStore-1);
    this.chat_history.splice(this.chat_history.length-1,0,newChannel.chat_history);
  }
  this.save(function(err){
    if(err){
      logger.error('There was an error in updating a public channel to the mongo database');
      callback(err);
    }
    else if(!err && callback){
      callback();
    }
  });
};

// create the model for users and expose it to the app
module.exports = mongoose.model('PublicChannel', PublicChannel);



