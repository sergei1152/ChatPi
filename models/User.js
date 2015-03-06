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
  createdAt: Date,
  name: String,
  onlineStatus: String,
  profile_picture: String,
  contacts: [String]
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
