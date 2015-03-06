var ChatPiApp = angular.module('ChatPiApp',[]);
ChatPiApp.factory("Message", function(){
  var Message=function(contents){
    this.contents=contents;
    this.date=Date.now();
  };
  return Message;
});
ChatPiApp.filter('urlParser',function(){
  return function (message){
    var parsedMessage=message || '';
	parsedMessage=parsedMessage.toString();
	var regURL=/((([A-Za-z]{3,9}:(?:\/\/)?)(?:[-;:&=\+\$,\w]+@)?[A-Za-z0-9.-]+|(?:www.|[-;:&=\+\$,\w]+@)[A-Za-z0-9.-]+)((?:\/[\+~%\/.\w-_]*)?\??(?:[-\+=&;%@.\w_]*)#?(?:[\w]*))?)/;

	parsedMessage=parsedMessage.replace(regURL, function parser(match){
		return "<a href='"+match+"'>"+match+"</a>";
	});
	return parsedMessage;
  };
});
ChatPiApp.controller('Conversation',function ($scope, Message) {

  $scope.conversation={message_history:[],new_message:""};

  $scope.send=function(){
    var cleanMessage=$scope.conversation.new_message.replace(/\s/g, '');
    if(cleanMessage!==""){  //checking for empty strings
      var message=new Message($scope.conversation.new_message);
      socket.emit('message', message); //sends the message contents to the server
      $scope.conversation.new_message=""; //clears the input area
    }
  };

  socket.on('message', function(msg) {
    console.log("message received");
    $scope.conversation.message_history.push(msg);
    $scope.$apply();
  });

});
