//loading required modules
var mongoose = require('mongoose');

//Creating the schema for the user
var Message = mongoose.Schema({
  senderUsername: String,
  senderName: String,
  dateSent: Date,
  dateSentInMinutes:Number,
  type: String,
  contents: String
});

module.exports = mongoose.model('Message', Message);
