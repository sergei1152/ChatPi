//initialazation of the app
var socket = io();
var selfName = "";
var selfUsername = "";
//Setting up the credentials for proper CSS Styling of messages
socket.on("metadata", function(data) {
    selfName = data.name;
    selfUsername = data.username;
    selfProfilePicture=data.profile_picture;
});

var ChatPiApp = angular.module('ChatPiApp', ['angularModalService','ui.bootstrap']);

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
});
socket.on('disconnect', function() {
    console.log("disconnected");
});
socket.on("error", function(msg) {
    console.error("An error occured with the connection to the chat server \n" + msg);
});
//
// ChatPiApp.directive('open-modal',
//    function() {
//       var openFindChannelModal = {
//          link :   function(scope, element, attrs) {
//             function openDialog() {
//               var element = angular.element('hello');
//               element.modal('show');
//             }
//             element.bind('click', openFindChannelModal);
//        }
//    }
//    return openFindChannelModal;
// });
//
// ChatPiApp.controller('ModalDemoCtrl', function ($scope, $modal, $log) {
//
//   $scope.items = ['item1', 'item2', 'item3'];
//
//   $scope.open = function (size) {
//
//     var modalInstance = $modal.open({
//       templateUrl: 'myModalContent.html',
//       controller: 'ModalInstanceCtrl',
//       size: size,
//       resolve: {
//         items: function () {
//           return $scope.items;
//         }
//       }
//     });
//
//     modalInstance.result.then(function (selectedItem) {
//       $scope.selected = selectedItem;
//     }, function () {
//       $log.info('Modal dismissed at: ' + new Date());
//     });
//   };
// });
//
// // Please note that $modalInstance represents a modal window (instance) dependency.
// // It is not the same as the $modal service used above.
//
// ChatPiApp.controller('ModalInstanceCtrl', function ($scope, $modalInstance, items) {
//
//   $scope.items = items;
//   $scope.selected = {
//     item: $scope.items[0]
//   };
//
//   $scope.ok = function () {
//     $modalInstance.close($scope.selected.item);
//   };
//
//   $scope.cancel = function () {
//     $modalInstance.dismiss('cancel');
//   };
// });
