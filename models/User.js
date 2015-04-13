//loading required modules
var mongoose = require('mongoose');
var bcrypt = require('bcrypt-nodejs');

//Creating the schema for the user
var userSchema = mongoose.Schema({
  username: {
    type: String,
    required: true,
    lowercase: true,
    unique:true,
    index:true
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
  subscribed_public_channels: {
    type:[],
    default:[]
  },

  //an array of all the private groups the user is apart of. Note this is only used for client side, server side verifcation is still done
  private_groups: [String],
  contacts: [String] //a string of usernames
});

// hash the password before the user is saved
userSchema.pre('save', function(next) {
  var user = this;
  // hash the password only if the password has been changed or user is new
  if (!user.isModified('password')) return next();
  bcrypt.hash(user.password, null, null, function(err, hash) {
    if (err) return next(err);

    // change the password to the hashed version
    user.password = hash;
    next();
  });
});

//checks if the password is valid
userSchema.methods.validPassword = function(password) {
  return bcrypt.compareSync(password, this.password);
};

// create the model for users and expose it to the app
module.exports = mongoose.model('User', userSchema);
