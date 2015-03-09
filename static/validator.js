//Does validation for the login and register form
var validatePicture=require('./pictureValidator.js');

var regUsername=/^[a-z0-9_-]{4,16}$/; //must contain at least 4 characters up to 16, can contain numbers, letters, and _ and -
var regPassword=/^[a-z0-9A-Z!$%^&+=*()@#_-]{8,128}$/;//password must be at least 8 characters long up to 128 and can have special characters
var regName=/^[a-z ]+$/i; //only letter characters allowed
module.exports=function(req,type){

  if(type=="login"){
    //check to see if a username and password field was passed in
    if(req.body.username && req.body.password){
      //make sure that both the username and password are valid
      if(req.body.username.toString().match(regUsername)&&req.body.password.toString().match(regPassword)){
        return true;
      }
      return false;
    }
    return false;
  }
  else if (type=="signup"){
    console.log("using sign up strategy");
    if(req.body.username && req.body.password && req.body.name){

      //if a file was uploaded
      if(req.files.profile_picture){
        console.log(req.files);
        console.log("picture found");
        if(!validatePicture(req.files)){ //validate the uploaded picture
          console.log("picture validation fails");
          return false; //return false if the picture is not proper
        }
      }
      //make sure that both the username and password and name are valid
      if(req.body.username.toString().match(regUsername)&&req.body.password.toString().match(regPassword) && req.body.name.toString().match(regName)){
        return true;
      }
      console.log("username name or password invalid regex");
      return false;
    }
    console.log("password or username or name does not exist");
    return false;
  }
  console.log("type not defined");
  return false;
};
