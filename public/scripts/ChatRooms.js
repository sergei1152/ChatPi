var ChatRooms = angular.module('ChatRooms', ['Validator','User','JoinedChatRooms','SubscribedChannels']);

//the chatrooms controller that manages everything on the left pane of the application
ChatRooms.controller('ChatRooms', function($scope, subscribedChannels, joinedChatRooms, User) {
  //for populating the public channels list on the left pane
  $scope.getSubscribedChannels = function() {
    return User.subscribed_public_channels;
  };

  $scope.joinChatRoom = function(room) {
    if(room.type==='channel') { //if the user selected to join a public channel
      if (!joinedChatRooms.findChannel(room)) { //check if the user already join the chat room
        socket.emit('joinRoom', room); //ask the server to join the channel

        //after the channel metadata has been retrieved
        socket.on('roomJoined', function (channel) {
          //inverting the order of the chat history (latest->oldest to oldest->latest), and checking if the sender is the current user
          if (channel.chat_history) {
            var parsed_chat_history = [];
            for (var i = channel.chat_history.length - 1; i >= 0; i--) {
              channel.chat_history[i]=JSON.parse(channel.chat_history[i]);

              if(channel.chat_history[i].senderUsername===User.username){
                channel.chat_history[i].self='self';
              }
              parsed_chat_history.push(channel.chat_history[i]);
            }
            channel.chat_history = parsed_chat_history;
          }
          else {
            channel.chat_history = [];
          }
          //changing the current room
          $scope.$apply(function () {
            joinedChatRooms.addChannel(channel);
            joinedChatRooms.changeCurrentRoom(channel);
          });
        });
      }
      else { //if the user had already joined the room
          joinedChatRooms.changeCurrentRoom(joinedChatRooms.findChannel(room));
      }
    }
  };

  //opens up the find and create public channels modals
  $scope.findPublicChannels = function() {
    $('#findPublicChannelModal').modal('show');
  };
  $scope.createPublicChannels = function() {
    $('#createPublicChannelModal').modal('show');
  };
});

//controller for the find public channels modal
//TODO MODULARIZE THIS FUNCITON
ChatRooms.controller('findPublicChannel', function($scope, subscribedChannels) {
  $scope.firstOpen = true;
  $scope.publicChannelsList = [];

  $scope.getPublicChannelsList = function() {
    $scope.publicChannelsList = [];
    $('#find-channel-spinner').css('display', 'block'); //shows the little spinner

    socket.emit('getPublicChannelsList', '');

    socket.on('publicChannelsList', function(channelList) {
      $scope.publicChannelsList = []; //TODO THIS EVENT IS FIRED TWICE FOR SOME REASON
      $scope.$apply(function() {
        /*goes through every entry and if already subscribed shows the checkmark
        to the user indicating that the channel has already been subscribed to */
        for (var i=0;i<channelList.length;i++){
          var newChannel=JSON.parse(channelList[i]);
          if(subscribedChannels.findChannel(newChannel)){
            newChannel.subscribeStatus='glyphicon-ok';
          }
          else{
            newChannel.subscribeStatus='glyphicon-plus';
          }
          $scope.publicChannelsList.push(newChannel);
        }
        $('#find-channel-spinner').css('display', 'none'); //stops showing the little spinner
      });
    });
  };

  //when the user subscribes to a channel
  //TODO Subscriptions should be a 2 way callback thing
  $scope.subscribeChannel = function(index) { //the index from the ng-repeat
    if (!subscribedChannels.findChannel($scope.publicChannelsList[index])) { //if the user is not already subscribed to a channel
      subscribedChannels.addChannel($scope.publicChannelsList[index]); //adds the channel locally
      $scope.publicChannelsList[index].subscribeStatus='glyphicon-ok'; //gives it the checkmark
      socket.emit('subscribeToChannel', $scope.publicChannelsList[index]); //adds the channel on the server side
    }
  };

  //TODO CALL THIS WITH A DIRECTIVE RATHER THAN JQUERY
  $('#findPublicChannelModal').on('shown.bs.modal', function() { //modal open event handler
    if ($scope.firstOpen) { //if this is the first time the modal is opened
      $scope.getPublicChannelsList(); //retrieves the list of public channels from the server
      $scope.firstOpen = false;
    }
    $('#findPublicChannelModalSearch').focus(); //auto focus on the search bar
  });

});
//controller for the find public channels modal
//TODO MODULARIZE THIS FUNCTION
ChatRooms.controller('createPublicChannel', function($scope, validateName,subscribedChannels) {
  $('#createPublicChannelAlert').css('display', 'none'); //hides the alert

  $scope.createPublicChannel = function() {
    if (validateName($scope.newChannelName)) {
      socket.emit("createPublicChannel",{
        name:$scope.newChannelName,
        description:$scope.newChannelDescription
      });

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
          $scope.$apply(function() {
            $scope.channelNameAvailability = taken;
          });
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