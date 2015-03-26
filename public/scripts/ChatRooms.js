var ChatRooms=angular.module('ChatRooms',[]);

//to keep track of the users subscribed channels
ChatRooms.service("subscribedChannels", function() {
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
  //checks the array to see if a channel id is in the array
  this.findChannel = function(channel) {
    for (var i=0;i<subscribedChannels.length;i++){
      if (channel.id===subscribedChannels[i].id) {
        return true;
      }
    }
    return false;
  };
});

//to keep track of the users joined chat rooms
ChatRooms.service("joinedChatRooms", function() {
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

//the chatrooms controller that manages everything on the left pane of the application
ChatRooms.controller('ChatRooms', function($scope,subscribedChannels,joinedChatRooms) {
  $scope.getSubscribedChannels=function(){
    return subscribedChannels.getChannels();
  };
  $scope.joinChatRoom=function(channel){
    if(!joinedChatRooms.findRoom(channel.id)){ //check if the user already join the chat room
      socket.emit('joinRoom',channel); //tell the server to join the room
    }
    joinedChatRooms.changeCurrentRoom(channel);
  };
  //opens up the find public channels modal
  $scope.findPublicChannels=function(){
    $('#findPublicChannelModal').modal('show');
  };
});

//controller for the find public channels modal
ChatRooms.controller('findPublicChannel', function($scope,subscribedChannels) {
  $scope.firstOpen=true; //for first retrieval of data
  $scope.publicChatRooms=null; //list of all public chat rooms in the database
  $scope.getPublicChannelsList=function(){ //retrieves the full list of public channels from the server
    $scope.publicChatRooms=null; //resets the view to blank
    $('#find-channel-spinner').css('display','block'); //shows the little spinner
    socket.emit('getPublicChannelsList',''); //asks the server for the list of public channels
    socket.on('publicChannelsList',function(data){ //when the server sends back the list
      $scope.$apply(function(){ //updates the view for the user
        $scope.publicChatRooms=data;
        $('#find-channel-spinner').css('display','none'); //stops showing the little spinner
      });
    });
  };
  $('#findPublicChannelModal').on('shown.bs.modal', function () { //modal open event handler
    if($scope.firstOpen){ //if this is the first time the modal is opened
      $scope.getPublicChannelsList(); //retrieves the list of public channels from the server
      $scope.firstOpen=false;
    }
    $('#findPublicChannelModalSearch').focus(); //auto focus on the search bar
  });

  //when the user subscribes to a channel
  $scope.subscribeChannel=function(index){ //the index from the ng-repeat
    if(!subscribedChannels.findChannel($scope.publicChatRooms[index])) { //if the user is not already subscribed to a channel
      subscribedChannels.addChannel($scope.publicChatRooms[index]); //adds the channel locally
      socket.emit('subscribeToChannel', $scope.publicChatRooms[index]); //adds the channel on the server side
    }
  };
});
