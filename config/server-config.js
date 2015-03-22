//this file contains the most important server configuration options

//Input your server configration here
module.exports={
  serverPort: 80,
  eventLoopBenchmark:false, //only enable if you're benchmarking
  temporaryFilesLocation:"./tmp/", //where to store the temporary files of the server from form data. Make sure the folder exists first
  maxFileUploadSize:25000000, //the maximum size of a file a user can upload to the server
  maxFileUploadNumber:1,//the maxmimum number of files a user can upload from a form
  sessionKey: "secret key", //you can change this to whatever you like, as long as it's a long sentence
  sessionIDName:"connectSID",
  supportedProfileImageTypes:['jpeg','jpg','png'],
  maxProfileImageSize:500000, //the maximum size of the profile picture a user can register with in bytes (default 500KB)
  livereload: true, //inject the live reload script to all webpages for use with grunt (for development use only)
  logRequests: false //log all http requests
};
