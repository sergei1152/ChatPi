var SubscribedChannels = angular.module('SubscribedChannels', ['User']);

//to keep track of the users subscribed channels
SubscribedChannels.service("subscribedChannels", function(User) {
  this.subscribedChannels = [];
  this.addChannel = function(channel) {
    this.subscribedChannels.push(channel);
  };
  this.setChannels = function(channels) {
    if(channels){
      this.subscribedChannels = JSON.parse(channels);
    }
  };
  this.getChannels = function() {
    return this.subscribedChannels;
  };
  //checks the array to see if a channel id is in the array
  this.findChannel = function(channel) {
    for (var i = 0; i < this.subscribedChannels.length; i++) {
      if (channel._id === this.subscribedChannels[i]._id) {
        return true;
      }
    }
    return false;
  };
});