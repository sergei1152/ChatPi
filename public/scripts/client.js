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
//filter that parses the dates to a human readable format
ChatPiApp.filter('dateParser',function(){
  return function (messageDate, currentDate){
    var differenceInMinutes=(currentDate-Math.ceil(messageDate/1000/60));
    if(differenceInMinutes<1){
      return "less than a minute ago";
    }
    else if (differenceInMinutes==1){
      return "1 minute ago";
    }
    else if (differenceInMinutes<60){
      return differenceInMinutes+" minutes ago";
    }
    else if (differenceInMinutes==60){
      return "1 hour ago";
    }
    else if (differenceInMinutes<60*24){
      return differenceInMinutes/60+" hours ago";
    }
    else if (differenceInMinutes==60*24){
      return "1 day ago";
    }
    else if (differenceInMinutes<60*24*7){
      return differenceInMinutes/60/24+"days ago";
    }
    else{
      return messageDate.toLocaleDateString();
    }
  };
});
ChatPiApp.controller('Conversation',function ($scope, Message) {

  $scope.conversation={message_history:[],new_message:""};
  $scope.getCurrentDate=function(){
    return Math.ceil(Date.now()/1000/60);//return the current minutes
  };
  $scope.send=function(){
    var cleanMessage=$scope.conversation.new_message.replace(/\s/g, '');
    if(cleanMessage!==""){  //checking for empty strings
      var message=new Message($scope.conversation.new_message);
      socket.emit('message', message); //sends the message contents to the server
      $scope.conversation.new_message=""; //clears the input area
    }
  };

  socket.on('message', function(msg) {
    $scope.conversation.message_history.push(msg);
    $scope.$digest();
    $scope.$apply();
  });

});
