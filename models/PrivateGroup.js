//loading required modules
var mongoose = require('mongoose');
var MessageSchema=require('./Message.js').schema; //the Message schema
var logger=require('../logger.js');

//Creating the schema for the user
var PrivateGroup = new mongoose.Schema({
  name: {
    type:String,
    required: true
  },
  description:{
    type:String,
    default: ''
  },
  createdAt: {
    type:Date,
    default: Date.now
  },
  chat_history: {
    type:[MessageSchema],
    default:[]
  },
  type:{
    type: String,
    default: 'group'
  },
  authorized_users: {
    type: [String],
    default: []
  }
});

// create the model for users and expose it to the app
module.exports = mongoose.model('PrivateGroup', PrivateGroup);



