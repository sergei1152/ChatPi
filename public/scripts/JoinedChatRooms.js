var JoinedChatRooms = angular.module('JoinedChatRooms', ['User']);

//to keep track of the users joined chat rooms
JoinedChatRooms.service("joinedChatRooms", function() {
  var joinedPrivateGroups = [];
  var joinedChannels=[];
  var currentRoom={
    name:"Welcome to ChatPi"
  };

  this.changeCurrentRoom = function(room) {
    currentRoom = room;
  };

  this.getCurrentRoom = function() {
    return currentRoom;
  };

  this.addChannel = function(channel) {
    joinedChannels.push(channel);
  };

  this.addGroup = function(group) {
    joinedPrivateGroups.push(group);
  };

  //searches for joined private groups, and returns it if found
  this.findGroup = function(group) {
    for (var i = 0; i < joinedPrivateGroups.length; i++) {
      if (group._id === joinedPrivateGroups[i]._id) {
        return joinedPrivateGroups[i];
      }
    }
    return false;
  };

  //searches for a joined public channel, and returns it if found
  this.findChannel = function(channel) {
    for (var i = 0; i < joinedChannels.length; i++) {
      if (channel.name === joinedChannels[i].name) {
        return joinedChannels[i];
      }
    }
    return false;
  };

  //adds a message to the rooms chat history
  this.addMessage = function(message) {
    var room=message.destination;

    if(room.type==='channel'){
      if(message.senderUsername===User.username){
        message.self='self';
      }
      this.findChannel(room).chat_history.push(message);
    }
    else if(room.type==='group'){
      if(message.senderUsername===User.username){
        message.self='self';
      }
      this.findGroup(room).chat_history.push(message);
    }
  };
});