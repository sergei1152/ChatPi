//The start module that initializes that angular app, the socket io connection, and handles incoming socket events for new messages
var socket = io(); //connecting to the socket server

var ChatPiApp = angular.module('ChatPiApp', ['luegg.directives','UX','MessageDate','ChatRooms','Message']);

//Runs at the beginning after all the services have been loaded
ChatPiApp.run(function($rootScope,User){

  //Receiving user metadata from the server
  socket.on("metadata", function(metadata){
    User.name = metadata.name;
    User.username = metadata.username;
    User.profile_picture=metadata.profile_picture;
    if(metadata.subscribed_public_channels){
      User.subscribed_public_channels=JSON.parse(metadata.subscribed_public_channels);
    }
    if(metadata.contacts){
      User.contacts=JSON.parse(metadata.contacts);
    }
    if(metadata.private_groups){
      User.contacts=JSON.parse(metadata.private_groups);
    }
    $rootScope.$apply(); //updates the view with the new information
  });

  //Disconnect/Error Events
  socket.on('disconnect', function() {
    console.warn('You\'ve been disconnected from the server');
  });
  socket.on("error", function() {
    console.error("An error occurred with the connection to the chat server");
  });
});

ChatPiApp.controller('Conversation', function($scope, Message, getDate,joinedChatRooms,User) {

  $scope.new_message=""; //the message the user will send

  $scope.send = function() {
    var cleanMessage = $scope.new_message.replace(/\s/g, '');

    //make sure the message is not empty and a chatroom has been joined
    if (cleanMessage !== "" && joinedChatRooms.getCurrentRoom()) {
      var destination={
        name:joinedChatRooms.getCurrentRoom().name,
        type:joinedChatRooms.getCurrentRoom().type
      };
      var message = new Message(
        $scope.new_message,
        "text", //for now only text based messages are supported
        destination
      );

      socket.emit('message', message); //sends the message contents to the server
      $scope.new_message = ""; //clears the input area
    }
  };

  //when a message has been received (doesn't matter what the current chat room is)
  socket.on('message', function(msg) {
    //adding the message to the chat history of the room
    $scope.$apply(
      joinedChatRooms.addMessage(msg)
    );
  });

  $scope.getCurrentRoom = function(){
    return joinedChatRooms.getCurrentRoom();
  };

  //for parsing the message dates in human friendly formats
  $scope.getDateInMinutes = function(){
    return getDate.currentDateInMinutes();
  };

  //for updating the message dates in the view every minute
  setInterval(function(){
    $scope.$apply();
  },60000);
});

ChatPiApp.controller('UserProfile', function($scope,User) {
  $scope.getUsername=function(){
    return User.username;
  };
  $scope.getName=function(){
    return User.name;
  };
  $scope.getProfilePicture=function(){
    return User.profile_picture;
  }
});