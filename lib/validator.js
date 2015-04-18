//Universal server side validation module that does validation for both usernames, passwords, and names (including public channel and private group names)
var logger=require('./../logger.js');//for pretty console outputs
var SERVER_SETTINGS = require('../config/server-config.js');

var regUsername=/^[a-zA-Z0-9_-]{4,16}$/; //must contain at least 4 characters up to 16, can contain numbers, letters, and _ and -
var regPassword=/^[a-z0-9A-Z!$%^&+=*()@#_ -]{8,128}$/;//password must be at least 8 characters long up to 128 and can have special characters (including spaces)
var regName=/^[a-zA-Z ]+$/i; //only letter characters and spaces allowed
var regChannel=/^[a-zA-Z #]+$/i; //only letter characters,hastags, and spaces allowed

module.exports.validateProfilePicture=function(req){
  //if the profile picture is under the specified size and if it has a valid extension
  if (req.files.profile_picture.size <= SERVER_SETTINGS.maxProfileImageSize && SERVER_SETTINGS.supportedProfileImageTypes.indexOf(req.files.profile_picture.extension) != -1) {
    return true;
  }
  logger.debug("A user tried registering however the profile picture did not pass validation");
  return false;
};

module.exports.validateLogin=function(req){
  //Make sure that a username and password was submitted in the form
  if(req.body && req.body.username && req.body.password){
    //Validate the username and password with regex
    if(req.body.username.toString().match(regUsername)&&req.body.password.toString().match(regPassword)){
      return true;
    }
    logger.debug("A user tried to login however the username/password did not pass validation");
    return false;
  }
  logger.debug("A user tried to login with empty username and password");
  return false;
};

module.exports.validateRegistration=function(req){
  //Make sure that a username, password and name were submitted
  if(req.body && req.body.username && req.body.password && req.body.name){
    //if a file(profile picture) was uploaded
    if(req.files && req.files.profile_picture){
      if(!module.exports.validateProfilePicture(req)){ //validate the uploaded picture
        return false; 
      }
    }
    //make sure that both the username and password and name are valid
    if(req.body.username.toString().match(regUsername)&&req.body.password.toString().match(regPassword) && req.body.name.toString().match(regName)){
      return true;
    }
    logger.debug("A user tried to register however the name/username/password did not pass validation");
    return false;
  }
  logger.debug("A user tried to register with an empty username/name/password");
  return false;
};

module.exports.validatePublicChannelName=function(channelName){
  if (channelName){
    if (channelName.toString().match(regChannel)){
      return true;
    }
    logger.debug("A user tried to create a new channel however validation for the channel name failed");
    return false;
  }
  logger.debug("A user tried to create a public channel however did not submit a channel name");
  return false;
};
