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
  profilePictureURL: String,
  contacts: [String]
});

//generates a salted hashed version of the password
userSchema.methods.generateHash = function(password) {
  return bcrypt.hash(password, bcrypt.genSalt(8), null);
};

//checks if the password is valid
userSchema.methods.validPassword = function(password) {
  return bcrypt.compare(password, this.local.password);
};

// Automattically hash the password if first save
userSchema.pre('save', function(next) {
  // if created_at doesn't exist, add to that field
  if (!this.createdAt) {
    // get the current date
    var currentDate = new Date();
    this.createdAt = currentDate;
    this.password = this.generateHash(this.password); //hashes the password
  }
  next();
});

// create the model for users and expose it to the app
module.exports = mongoose.model('User', userSchema);
