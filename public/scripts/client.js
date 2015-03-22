//initialazation of the app
var socket = io();
var selfName = "";
var selfUsername = "";
//Setting up the credentials for proper CSS Styling of messages
socket.on("metadata", function(data) {
    selfName = data.clientName;
    selfUsername = data.clientUsername;
    selfProfilePicture=data.clientProfilePic;
});

var ChatPiApp = angular.module('ChatPiApp', ['luegg.directives']);

ChatPiApp.factory("Message", function() {
    var Message = function(contents, type) {
        this.contents = contents;
        this.type = type;
    };
    return Message;
});
//service that returns the current date in minutes to be used in message dates
ChatPiApp.service("getDate", function() {
    this.currentDateInMinutes = function() {
        return Math.ceil(Date.now() / 1000 / 60); //return the current minutes
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
ChatPiApp.controller('Conversation', function($scope, Message, getDate) {
    $scope.getDateInMinutes = getDate.currentDateInMinutes;
    $scope.conversation = {
        message_history: [],
        new_message: ""
    };
    $scope.send = function() {
        var cleanMessage = $scope.conversation.new_message.replace(/\s/g, '');
        if (cleanMessage !== "") { //checking for empty strings
            var message = new Message($scope.conversation.new_message, "text");
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
ChatPiApp.controller('ChatRooms', function($scope) {
  var publicChannels={
    show:false, //wether the user is currently viewing the modal
    firstShow: true, //wether this is the first time the modal is being shown(so retrieve data)
    getChannelList: function(){
      socket.emit('getChannels',null);
    }
  };

  //shows the modal
  $scope.openPublicChannel=function(){
    $('#findChannelsModal').modal('show');
    if(publicChannel.firstShow){
      publicChannel.getChannelList();
    }

  };
});
ChatPiApp.directive('openModal', function () {
    return function (scope, element, attrs) {
      element.bind("click", function (event) {
        scope.$eval(attrs.openModal); //open the modal as specified in the attribute
      });

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
