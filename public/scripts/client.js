//initialazation of the app
var socket = io();
var selfName = "";
var selfUsername = "";
var subscribedChannels=[];


var ChatPiApp = angular.module('ChatPiApp', ['luegg.directives']);

ChatPiApp.run(function(subscribedChannels){
  //Setting up the credentials for proper CSS Styling of messages
  socket.on("metadata", function(metadata) {
    selfName = metadata.clientName;
    selfUsername = metadata.clientUsername;
    selfProfilePicture=metadata.clientProfilePic;
    subscribedChannels.setChannels(metadata.subscribedChannels);
    console.log(metadata.subscribedChannels);
    console.log(subscribedChannels.getChannels());
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
//service that returns the current date in minutes to be used in message dates
ChatPiApp.service("getDate", function() {
  this.currentDateInMinutes = function() {
    return Math.ceil(Date.now() / 1000 / 60); //return the current minutes
  };
});
//service that returns the current date in minutes to be used in message dates
ChatPiApp.service("subscribedChannels", function() {
  var subscribedChannels=[];
  this.addChannel=function(channel){
    subscribedChannels.push(channel);
  };
  this.setChannels=function(channels){
    subscribedChannels=channels;
  };
  this.getChannels = function() {
    return subscribedChannels;
  };
});
//service that returns the current date in minutes to be used in message dates
ChatPiApp.service("joinedChatRooms", function() {
  var joinedChatRooms=[];
  var currentRoom;
  this.changeCurrentRoom=function(room){
    currentRoom=room;
  };
  this.getCurrentRoom=function(){
    return currentRoom;
  }
  this.addRoom=function(room){
    joinedChatRooms.push(room);
  };
  this.getRooms = function() {
    return joinedChatRooms;
  };
  //checks the array to see if a room id is in the array
  this.findRoom = function(id) {
    for (var i=0;i<joinedChatRooms.length;i++){
      if (id===joinedChatRooms[i].id) {
        return true;
      }
    }
    return false;
  };
});

//filter that parses the differnce between dates to a human readable format (eg. 5 minutes ago, less than a minute ago)
//note that the current date must be passed in from the filter so as for the
//$digest cycle to recognize a change in the time and refresh the filtered dates
ChatPiApp.filter('dateParser', function() {
  return function(messageDate, currentDate) {
    var differenceInMinutes = (currentDate - messageDate);
    if (differenceInMinutes < 1) {
      return "less than a minute ago";
    } else if (differenceInMinutes == 1) {
      return "1 minute ago";
    } else if (differenceInMinutes < 60) {
      return differenceInMinutes + " minutes ago";
    } else if (differenceInMinutes < 60 * 2) {
      return "1 hour ago";
    } else if (differenceInMinutes < 60 * 24) {
      return Math.round(differenceInMinutes / 60) + " hours ago";
    } else if (differenceInMinutes < 60 * 24 * 2) {
      return "1 day ago";
    } else if (differenceInMinutes < 60 * 24 * 7) {
      return Math.round(differenceInMinutes / 60 / 24) + "days ago";
    } else {
      return messageDate.toLocaleDateString();
    }
  };
});
ChatPiApp.controller('Conversation', function($scope, Message, getDate,joinedChatRooms) {
  $scope.getDateInMinutes = getDate.currentDateInMinutes;
  $scope.conversation = {
    message_history: [],
    new_message: ""
  };
  $scope.send = function() {
    var cleanMessage = $scope.conversation.new_message.replace(/\s/g, '');
    if (cleanMessage !== "") { //checking for empty strings
      console.log(joinedChatRooms.getCurrentRoom());
      var message = new Message($scope.conversation.new_message, "text",joinedChatRooms.getCurrentRoom());
      socket.emit('message', message); //sends the message contents to the server
      $scope.conversation.new_message = ""; //clears the input area
    }
  };
  socket.on('message', function(msg) {
    //checks if the sender is the user, and if so applies appropriate styling to the message
    if (msg.senderUsername == selfUsername) {
      msg.self = "self"; //corresponds to the .self class
    } else {
      msg.self = ""; //applies no class (default)
    }
    $scope.$apply(
      $scope.conversation.message_history.push(msg)
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
      scope.$eval(attrs.openModal); //open the modal as specified in the attribute
    });
  };
});

ChatPiApp.controller('ChatRooms', function($scope,subscribedChannels,joinedChatRooms) {
  $scope.getChannels=function(){
    return subscribedChannels.getChannels();
  };
  $scope.joinChatRoom=function(channel){
    if(!joinedChatRooms.findRoom(channel.id)){
      socket.emit('joinRoom',channel);
    }
    joinedChatRooms.changeCurrentRoom(channel);
  };
  //opens up the find public channels modal
  $scope.openPublicChannel=function(){
    $('#findChannelsModal').modal('show');
  };
});

//controller for the find public channels modal
ChatPiApp.controller('findPublicChannelModal', function($scope,subscribedChannels) {
  $scope.firstOpen=true; //for first retrieval of data
  $scope.publicChatRooms=null;

  //when the modal is open event handler
  $('#findChannelsModal').on('shown.bs.modal', function () {
    if($scope.firstOpen){
      $scope.getChannels(); //retrives the list of public channels from the server
      $scope.firstOpen=false;
    }
    $('#searchFindChannel').focus(); //autofocus on the search bar
  });

  $scope.getChannels=function(){
    $scope.publicChatRooms=null;
    $('#find-channel-spinner').css('display','block'); //shows the little spinner

    socket.emit('getPublicChannels',''); //asks the server for the list of public channels

    socket.on('publicChannelsList',function(data){ //when the server sends back the list
      $scope.publicChatRooms=data;
      $('#find-channel-spinner').css('display','none'); //stops showing the little spinner
      $scope.$apply(); //updates the list
    });
  };
  //if the user wants to subscribe to a channel
  $scope.subscribeChannel=function(index){
    subscribedChannels.addChannel($scope.publicChatRooms[index]); //adds the channel locally
    console.log(subscribedChannels.getChannels());
    socket.emit('subscribeToChannel',$scope.publicChatRooms[index]); //adds the channel on the server side
  };
});

socket.on('disconnect', function() {
  console.log("disconnected");
});
socket.on("error", function(msg) {
  console.error("An error occured with the connection to the chat server \n" + msg);
});
//executes the send function when the enter button is pressed within a text area
ChatPiApp.directive('ngEnter', function () {
  return function (scope, element, attrs) {
    element.bind("keydown keypress", function (event) {
      //if only the enter key is pressed (without shift key)
      if(event.which === 13 && !event.shiftKey) {
        scope.$apply(function (){
          scope.$eval(attrs.ngEnter); //will execute the function within the attribute
        });
        event.preventDefault();
      }
    });
  };
});
