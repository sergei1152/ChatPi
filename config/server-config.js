//this file contains the most important server configuration options

//Input your server configration here
module.exports={
  temporaryFilesLocation:"./tmp/", //where to store the temporary files of the server from form data
  maxFileUploadSize:25000000, //the maximum size of a file a user can upload to the server
  maxFileUploadNumber:1,//the maxmimum number of files a user can upload from a form
  sessionKey: "secret key", //you can change this to whatever you like, as long as it's a long sentence
  sessionIDName:"connectSID"
};
