//Validates the uploaded profile picture from the sign up form
var SERVER_SETTINGS = require('../config/server-config.js');

//parameter should be the req.files object
module.exports = function(files) {
  if (files.profile_picture) { //if a profile picture was uploaded
    //if the profile picture is under the specified size and if it has a valid extension
    if (files.profile_picture.size <= SERVER_SETTINGS.maxProfileImageSize && SERVER_SETTINGS.supportedProfileImageTypes.indexOf(files.profile_picture.extension) != -1) {
      return true;
    }
    return false;
  }
  return false;
};
