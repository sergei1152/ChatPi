//loading required modules
var mongoose = require('mongoose');
var bcrypt = require('bcrypt-nodejs');

//Creating the schema for the user
var userSchema = mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    min: 8,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  name: {
    type: String,
    required: true
  },
  onlineStatus: {
    type:String,
    default:'offline'
  },
  profile_picture: {
    type: String,
    default:"default.png"
  },
  subscribed_public_channels: [String], // an array of subscribed public channels

  //an array of all the private groups the user is apart of. Note this is only used for client side, server side verifcation is still done
  private_groups: [String],
  contacts: [String] //a string of usernames
});

//generates a salted hashed version of the password
userSchema.methods.generateHash = function(password) {
  return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

//checks if the password is valid
userSchema.methods.validPassword = function(password) {
  return bcrypt.compareSync(password, this.password);
};

// create the model for users and expose it to the app
module.exports = mongoose.model('User', userSchema);
