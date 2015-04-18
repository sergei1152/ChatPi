//loading required modules
var mongoose = require('mongoose');
var MessageSchema=require('./Message.js').schema; //the Message schema
var Message=require('./Message.js'); //the Message model
var logger=require('../logger.js');
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
  type:{
    type: String,
    default: 'channel'
  },

  chat_history: {
    type:[MessageSchema],
    default:[]
  }
});
function createMessage(channel,message,callback){
  var newMessage=new Message();
  newMessage.senderUsername = message.senderUsername;
  newMessage.senderName = message.senderName;
  newMessage.contents = message.contents;
  newMessage.type = message.type;
  newMessage.dateSent = message.dateSent;
  newMessage.dateSentInMinutes = message.dateSentInMinutes;
  newMessage.senderProfilePicture = message.senderProfilePicture;
  channel.chat_history.push(newMessage);
  callback();
}
PublicChannel.methods.addMessageHistory=function(jsonMessageArray) {
  async.eachSeries(jsonMessageArray,createMessage.bind(null,this),function(err){
    logger.info('Finished creating the new message objects');
  });
};

PublicChannel.methods.update=function(newChannel,callback){
  if(this.description!==newChannel.description){
    this.name=newChannel.description;
  }
  //if there are more than 25 messages in the mongodb database and more than 25 in the redis, than new messages must have come
  if(this.chat_history.length>=SERVER_SETTINGS.numMessageToStore &&newChannel.chat_history.length>SERVER_SETTINGS.numMessageToStore){
    newChannel.chat_history.splice(0,SERVER_SETTINGS.numMessageToStore);
    this.addMessageHistory(newChannel.chat_history);
  }
  //if there are less than 25 messages in the mongo database and the redis has more messages, than more messages must have come
  else if(this.chat_history.length<SERVER_SETTINGS.numMessageToStore && newChannel.chat_history.length>this.chat_history.length){
    //to account for the edge cases for when the history is empty
    if(this.chat_history.length>0){
      newChannel.chat_history.splice(0,this.chat_history.length);
      this.addMessageHistory(newChannel.chat_history);
    }

    else if(this.chat_history.length===0){
      this.addMessageHistory(newChannel.chat_history);
    }
  }
  this.save(function(err){
    if(err){
      logger.error('There was an error in updating a public channel to the mongo database');
      if(callback){
        callback(err);
      }
    }
    else if(!err && callback){
      callback();
    }
  });
};

// create the model for users and expose it to the app
module.exports = mongoose.model('PublicChannel', PublicChannel);



