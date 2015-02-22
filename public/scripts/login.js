//initializing socket
var socket = io();

//Sets the content value of the login-message div that tells the user whether login was unsuccessful
function setMessage(content){
  $("#login-message").text(content);
  $("#login-message").css({"display":"inline-block"});
}
//validation function used to validate the lenght and contents of the username and password
function validate(input){
  //regex that only allows alphanumeric characters
  var reg=/^[a-z0-9]+$/i;

  if (input.length>=4 && input!=null && input!="" && reg.test(input)){
      return true;
  }
  setMessage("The username/password must be at least 4 characters long");
  return false;
}
function login(){
  //Getting the values of username and password from the form fields
  var username=$("#username-input").val();
  var password=$("#password-input").val();

  //if the input is valid
  if (validate(username) && validate(password)){
    //Sending the values to the server for verification
    socket.emit('login', {username:username, password:password});

    socket.on('login_status', function(status){
      //if the login was successful
      if(status){
        //redirects to the actual app page
        window.location.replace("app.html");
        return true;
      }
      //If the login was unsuccessful
      else{
        setMessage("Sorry... Incorrect login");
        return false;
      }
    });
  }
  else{
    return false;//stops form submission due to invalid input
  }

}
