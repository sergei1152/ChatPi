var ChatRooms = angular.module('ChatRooms', ['Validator','User']);

//to keep track of the users subscribed channels
ChatRooms.service("subscribedChannels", function(User) {
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

//to keep track of the users joined chat rooms
ChatRooms.service("joinedChatRooms", function(User) {
  var joinedChatRooms = [];
  var currentRoom={
    name:"Welcome to ChatPi. Please select a channel to begin"
  };
  this.changeCurrentRoom = function(room) {
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

//the chatrooms controller that manages everything on the left pane of the application
ChatRooms.controller('ChatRooms', function($scope, subscribedChannels, joinedChatRooms) {
  $scope.getSubscribedChannels = function() {
    return subscribedChannels.getChannels();
  };
  $scope.joinChatRoom = function(channel) {
    if (!joinedChatRooms.findRoom(channel.id)) { //check if the user already join the chat room
      socket.emit('joinRoom', channel); //tell the server to join the room
      socket.on('roomJoined', function (channel) {
        var parsed_chat_history=[];
        for(var i=0;i<channel.chat_history.length;i++){
          parsed_chat_history.push(JSON.parse(channel.chat_history[i]));
        }
        channel.chat_history=parsed_chat_history;
        console.log(channel.chat_history);
        $scope.$apply(function () {
          joinedChatRooms.addRoom(channel);
          joinedChatRooms.changeCurrentRoom(channel);
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
    socket.on('publicChannelsList', function(channelList) { //when the server sends back the list
      $scope.$apply(function() { //updates the view for the user
        for (var i=0;i<channelList.length;i++){
          var newChannel=JSON.parse(channelList[i]);
          if(subscribedChannels.findChannel(newChannel)){
            newChannel.subscribeStatus='glyphicon-ok';
          }
          else{
            newChannel.subscribeStatus='glyphicon-plus';
          }
          $scope.publicChatRooms.push(newChannel);
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
      $scope.publicChatRooms[index].subscribeStatus='glyphicon-ok';
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
        $scope.$apply(function(){
          subscribedChannels.addChannel(channel); //subscribes to the channel client side
          socket.emit('subscribeToChannel',channel); //subscribes to the channel server-side
          $scope.newChannelName='';
          $scope.newChannelDescription='';
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
  $scope.newChannelName="";
  $scope.newChannelDescription="";
  $scope.createChannelMessage = '';
  $scope.channelNameAvailability = "Check Availability";
  $scope.channelNameCreationStatus = "Create Channel";
});