//This module has everything to do with the filters and directives responsible for the user experience
var User=angular.module('UX',[]);
//service that returns the current date in minutes to be used in message dates
User.service("User", function() {
  this.selfName='';
  this.selfUsername='';
  this.selfProfilePicture='';
});
