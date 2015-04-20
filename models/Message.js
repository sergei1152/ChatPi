//loading required modules
var mongoose = require('mongoose');

//Creating the schema for the user
var Message = mongoose.Schema({
  senderUsername: String,
  senderName: String, //should get rid of this as soon will no longer be necessary
  senderProfilePicture: String,
  dateSent: {
    type: Date,
    default: Date.now()
  },
  dateSentInMinutes:{
    type:Number
  },
  type: String,
  contents: String,
  destination:{}
});
module.exports.schema = Message;
module.exports = mongoose.model('Message', Message);
