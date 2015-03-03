var ChatPiApp = angular.module('ChatPiApp',[]);

ChatPiApp.controller('Conversation',function ($scope) {

  $scope.conversation={message_history:[String],new_message:""};

  $scope.send=function(){
    var cleanMessage=$scope.conversation.new_message.replace(/\s/g, '');
    if(cleanMessage!==""){  //checking for empty strings
      socket.emit('message', $scope.conversation.new_message); //sends the message contents to the server
      $scope.conversation.new_message=""; //clears the input area
    }
  };

  socket.on('message', function(msg) {
    console.log("message received");
    $scope.conversation.message_history.push(msg);
    $scope.$apply();
  });

});
