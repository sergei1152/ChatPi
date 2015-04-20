//handles public channels subscriptions
var SubscribedChannels = angular.module('SubscribedChannels', ['User']);

SubscribedChannels.service("subscribedChannels", function(User) {

  //Looks through all subscriptions and tries to find a matching one
  //Used to make sure the user doesn't add the same subscription twice
  this.findChannel=function(channel){
    if(!User.subscribed_public_channels){
      return false;
    }
    for(var i=0;i<User.subscribed_public_channels.length;i++){
      if(channel.name===User.subscribed_public_channels[i].name){
        return User.subscribed_public_channels[i];
      }
    }
    return false;
  };

  this.addChannel=function(channel){
    User.subscribed_public_channels.push(channel);
  };
});