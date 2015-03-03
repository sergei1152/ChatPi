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
    $scope.conversation.message_history.push(msg);
  });

});
//
// $('form').submit(function() {
//   //Sends the message contents to the specified chatroom
//   socket.emit('message', $('#message-text-input').val());
//   $('#message-text-input').val('');
//   return false;
// });
// //Is called when it receives the 'chat message' event from the server,
// //after which is appends it to the html
// socket.on('message', function(msg) {
//   $('#messages-list').append($('<li class="messages">').text(msg));
//   $("#messages-list").animate({
//     "scrollTop": $('#messages-list')[0].scrollHeight
//   }, "slow");
// });
