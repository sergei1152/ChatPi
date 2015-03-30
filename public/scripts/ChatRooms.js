var ChatRooms = angular.module('ChatRooms', ['Validator']);

//to keep track of the users subscribed channels
ChatRooms.service("subscribedChannels", function() {
  this.subscribedChannels = [];
  this.addChannel = function(channel) {
    this.subscribedChannels.push(channel);
  };
  this.setChannels = function(channels) {
    if(channels){
      this.subscribedChannels = channels;
    }
  };
  this.getChannels = function() {
    return this.subscribedChannels;
  };
  //checks the array to see if a channel id is in the array
  this.findChannel = function(channel) {
    console.log(this.subscribedChannels);
    for (var i = 0; i < this.subscribedChannels.length; i++) {
      if (channel._id === this.subscribedChannels[i]._id) {
        return true;
      }
    }
    return false;
  };
});

//to keep track of the users joined chat rooms
ChatRooms.service("joinedChatRooms", function() {
  var joinedChatRooms = [];
  var currentRoom={
    name:"Welcome to ChatPi. Please select a channel to begin"
  };
  this.changeCurrentRoom = function(room) {
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
        joinedChatRooms[i].chat_history.push(message);
      }
    }
  };
});

//the chatrooms controller that manages everything on the left pane of the application
ChatRooms.controller('ChatRooms', function($scope, subscribedChannels, joinedChatRooms) {
  $scope.getSubscribedChannels = function() {
    return subscribedChannels.getChannels();
  };
  $scope.joinChatRoom = function(channel) {
    if (!joinedChatRooms.findRoom(channel.id)) { //check if the user already join the chat room
      socket.emit('joinRoom', channel); //tell the server to join the room
      socket.on('roomJoined', function (channel) {
        channel=JSON.parse(channel);
        $scope.$apply(function () {
          joinedChatRooms.changeCurrentRoom(channel);
          joinedChatRooms.addRoom(channel);
        });
      });
    }
    else{
      joinedChatRooms.changeCurrentRoom(channel);
    }
  };
  //opens up the find public channels modal
  $scope.findPublicChannels = function() {
    $('#findPublicChannelModal').modal('show');
  };
  $scope.createPublicChannels = function() {
    $('#createPublicChannelModal').modal('show');
  };
});

//controller for the find public channels modal
ChatRooms.controller('findPublicChannel', function($scope, subscribedChannels) {
  $scope.firstOpen = true; //for first retrieval of data
  $scope.publicChatRooms = []; //list of all public chat rooms in the database
  $scope.getPublicChannelsList = function() { //retrieves the full list of public channels from the server
    $scope.publicChatRooms = []; //resets the view to blank
    $('#find-channel-spinner').css('display', 'block'); //shows the little spinner
    socket.emit('getPublicChannelsList', ''); //asks the server for the list of public channels
    socket.on('publicChannelsList', function(data) { //when the server sends back the list
      $scope.$apply(function() { //updates the view for the user
        for (var i=0;i<data.
          length;i++){
          $scope.publicChatRooms.push(JSON.parse(data[i]));
        }
        $('#find-channel-spinner').css('display', 'none'); //stops showing the little spinner
      });
    });
  };
  $('#findPublicChannelModal').on('shown.bs.modal', function() { //modal open event handler
    if ($scope.firstOpen) { //if this is the first time the modal is opened
      $scope.getPublicChannelsList(); //retrieves the list of public channels from the server
      $scope.firstOpen = false;
    }
    $('#findPublicChannelModalSearch').focus(); //auto focus on the search bar
  });

  //when the user subscribes to a channel
  $scope.subscribeChannel = function(index) { //the index from the ng-repeat
    if (!subscribedChannels.findChannel($scope.publicChatRooms[index])) { //if the user is not already subscribed to a channel
      subscribedChannels.addChannel($scope.publicChatRooms[index]); //adds the channel locally
      socket.emit('subscribeToChannel', $scope.publicChatRooms[index]); //adds the channel on the server side
    }
  };
});
//controller for the find public channels modal
ChatRooms.controller('createPublicChannel', function($scope, subscribedChannels, validateName) {
  $('#createPublicChannelAlert').css('display', 'none'); //hides the alert

  $scope.createPublicChannel = function() {
    if (validateName($scope.newChannelName)) {
      socket.emit("CreatePublicChannel",{name:$scope.newChannelName,description:$scope.newChannelDescription});
      $scope.channelNameCreationStatus = "Creating Channel..";
      socket.on("ChannelCreated",function(channel){
        console.log(channel);
        $scope.$apply(function(){
          subscribedChannels.addChannel(channel); //subscribes to the channel client side
          socket.emit('subscribeToChannel',channel); //subscribes to the channel server-side
        });
        $("#createPublicChannelModal").modal('hide');

      });
    }
    else {
      $scope.createChannelMessage = 'Name must be between 4 and 16 characters long and have no special characters';
      $scope.alertLevel = 'alert-danger';
      $('#createPublicChannelAlert').css('display', 'block');
    }
  };
  $scope.checkPublicChannelName = function() {
    if (validateName($scope.newChannelName)) {
      socket.emit('checkPublicChannelName', $scope.newChannelName);
      $scope.channelNameAvailability = "Checking availability...";

      socket.on('PublicChannelNameStatus', function(taken) {
        console.log(taken);
        if (taken) {
          $scope.$apply(function() {
            $scope.channelNameAvailability = "Name already taken...";
          });
        } else {
          $scope.$apply(function() {
            $scope.channelNameAvailability = "Name Available!";
          });
        }
      });
    } else {
      $scope.createChannelMessage = 'Name must be between 4 and 16 characters long and have no special characters';
      $scope.alertLevel = 'alert-danger';
      $('#createPublicChannelAlert').css('display', 'block');
    }
  };
  $scope.newChannelName;
  $scope.newChannelDescription;
  $scope.createChannelMessage = '';
  $scope.channelNameAvailability = "Check Availability";
  $scope.channelNameCreationStatus = "Create Channel";
});