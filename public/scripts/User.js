//The user module that carries the current user's properties
var User=angular.module('User',[]);

User.service("User", function() {
  this.name='';
  this.username='';
  this.profile_picture='';
  this.subscribed_public_channels={};
  this.contacts={};
  this.private_groups={};
  this.notifications={};
});
