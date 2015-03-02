var ChatPiApp = angular.module('ChatPiApp',[]);

ChatPiApp.controller('Conversation',function ($scope) {
  $scope.chat_history={messageHistory:[String],newMessage:String};
  $scope.chat_history.newMessage="some defualt text";
  $scope.send2=function(){
    console.log("send executed");
    $scope.chat_history.newMessage="";
  };
  $scope.send2();
  // $scope.messages.push("test message");
  //
  // $scope.messages.push("test message");


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
