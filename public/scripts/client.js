var socket = io(); //initialization of client side socket app

var ChatPiApp = angular.module('ChatPiApp', ['luegg.directives','UX','MessageDate','ChatRooms']); //initialization of angular app

ChatPiApp.run(function($rootScope,subscribedChannels,User){ //to be run at the beginning after all the services are loaded
  //Receiving user metadata from the server
  socket.on("metadata", function(metadata){
    User.name = metadata.name;
    User.username = metadata.username;
    User.profile_picture=metadata.profile_picture;
    subscribedChannels.setChannels(metadata.subscribed_channels);
    $rootScope.$apply(); //updating the scope with the received subscribed public channels
  });
  socket.on('disconnect', function() {
    console.warn('You were disconnected from the server');
  });
  socket.on("error", function(msg) {
    console.error("An error occurred with the connection to the chat server \n" + msg);
  });
});
//The Message Object
ChatPiApp.factory("Message", function() {
  var Message = function(contents, type, destination) {
    this.contents = contents;
    this.type = type;
    this.destination=destination;
  };
  return Message;
});

ChatPiApp.controller('Conversation', function($scope, Message, getDate,joinedChatRooms,User) {
  $scope.getDateInMinutes = function(){
    return getDate.currentDateInMinutes();
  };
  $scope.conversation = {
    message_history: [],
    new_message: ""
  };
  $scope.getCurrentRoom = function(){
    return joinedChatRooms.getCurrentRoom();
  };
  $scope.send = function() {
    var cleanMessage = $scope.conversation.new_message.replace(/\s/g, '');
    if (cleanMessage !== "" && joinedChatRooms.getCurrentRoom()) { //checking for empty strings and for empty chat room
      var message = new Message($scope.conversation.new_message, "text",joinedChatRooms.getCurrentRoom());
      socket.emit('message', message); //sends the message contents to the server
      $scope.conversation.new_message = ""; //clears the input area
    }
  };
  socket.on('message', function(msg) {
    $scope.$apply(
      joinedChatRooms.addMessageHistory(msg.destination,msg)
    );
  });

  //automatically updates the date time every minute without the need for user interaction
  setInterval(function(){
    $scope.$apply();
  },60000);
});
ChatPiApp.controller('UserSettings', function($scope,User) {
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
ChatPiApp.directive('openModal', function () {
  return function (scope, element, attrs) {
    element.bind("click", function (event) {
      $(attrs.openModal).modal('show');
    });
  };
});
