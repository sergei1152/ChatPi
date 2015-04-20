//Message Object
var Message=angular.module('Message',[]);

Message.factory("Message", function() {
  var Message = function(contents, type, destination) {
    this.contents = contents;
    this.type = type;
    this.destination=destination;
  };
  return Message;
});