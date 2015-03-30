var socket = io(); //initialization of client side socket app

var ChatPiApp = angular.module('ChatPiApp', ['luegg.directives','UX','MessageDate','ChatRooms']); //initialization of angular app

ChatPiApp.run(function($rootScope,subscribedChannels,User){ //to be run at the beginning after all the services are loaded
  //Receiving user metadata from the server
  socket.on("metadata", function(metadata) {
    User.selfName = metadata.clientName;
    User.selfUsername = metadata.clientUsername;
    User.selfProfilePicture=metadata.clientProfilePic;
    subscribedChannels.setChannels(metadata.subscribedChannels);
    console.log(metadata.subscribedChannels);
    $rootScope.$apply(); //updating the scope with the received subscribed public channels
  });
  socket.on('disconnect', function() {
    console.warn('You were disconnected from the server');
  });
  socket.on("error", function(msg) {
    console.error("An error occured with the connection to the chat server \n" + msg);
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
    $('#conversation').mCustomScrollbar("scrollTo",'bottom');
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

ChatPiApp.directive('openModal', function () {
  return function (scope, element, attrs) {
    element.bind("click", function (event) {
      $(attrs.openModal).modal('show');
    });
  };
});
