var JoinedChatRooms = angular.module('JoinedChatRooms', ['User']);

//to keep track of the users joined chat rooms
JoinedChatRooms.service("joinedChatRooms", function(User) {
  var joinedChatRooms = [];
  var currentRoom={
    name:"Welcome to ChatPi"
  };
  this.changeCurrentRoom = function(room) {
    //for prettier CSS styling
    for(var i=0;i<room.chat_history.length;i++){
      if(room.chat_history[i].senderUsername===User.selfUsername){
        room.chat_history[i].self='self';
      }
    }
    currentRoom = room;
  };
  this.getCurrentRoom = function() {
    return currentRoom;
  };
  this.addRoom = function(room) {
    joinedChatRooms.push(room);
  };
  this.getRooms = function() {
    return joinedChatRooms;
  };
  //checks the array to see if a room id is in the array
  this.findRoom = function(id) {
    for (var i = 0; i < joinedChatRooms.length; i++) {
      if (id === joinedChatRooms[i]._id) {
        return joinedChatRooms[i];
      }
    }
    return false;
  };
  //checks the array to see if a room id is in the array
  this.addMessageHistory = function(channelID, message) {
    for (var i = 0; i < joinedChatRooms.length; i++) {
      if (channelID === joinedChatRooms[i]._id) {
        if(message.senderUsername===User.selfUsername){
          message.self='self';
        }
        joinedChatRooms[i].chat_history.push(message);
      }
    }
  };
});