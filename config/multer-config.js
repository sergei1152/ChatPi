//Configuration for multer, a module that parses multipart form data (forms with file uploads)
//Currently only used for profile picture uploads
var multer = require('multer');
var SERVER_SETTINGS=require("./server-config");
var logger=require('../logger');
var fs=require('fs');
module.exports = multer({
  //Destination of where multer will store it's uploaded
  dest: SERVER_SETTINGS.temporaryFilesLocation,

  //renames the uploaded files
  rename: function(fieldname, filename) {
    return filename.replace(/\W+/g, '-').toLowerCase() + Date.now();
  },
  //sets limits on the uploaded files
  limits: {
    fileSize: SERVER_SETTINGS.maxProfileImageSize, //the max files size
    files: SERVER_SETTINGS.maxFileUploadNumber //the max number of files
  },
  onError: function(error, next) {
    logger.error("An error occured while parsing a multipart form \n" + error);
    next(error);
  },
  onFileSizeLimit: function(file) {
    logger.warn("Multer: A file failed to upload because it was too large \n" ,{file:file});
    fs.unlink('./' + file.path); // delete the partially written file
  },
  onFilesLimit: function() {
    logger.warn("Multer: File limit crossed. No more files will be uploaded \n" + file);
  }
});
