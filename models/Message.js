//loading required modules
var mongoose = require('mongoose');

//Creating the schema for the user
var Message = mongoose.Schema({
  senderUsername: String,
  senderName: String, //should get rid of this as soon will no longer be necessary
  senderProfilePicture: String,
  dateSent: Date,
  dateSentInMinutes:Number, //for sending back to the client for display purposes only
  type: String,
  contents: String
});
module.exports.schema = Message;
module.exports = mongoose.model('Message', Message);
