//This module has everything to do with the services and filters required to parse the message dates
var MessageDate=angular.module('MessageDate',[]);

//service that returns the current date in minutes to be used in message dates
MessageDate.service("getDate", function() {
  this.currentDateInMinutes = function() {
    return Math.ceil(Date.now() / 1000 / 60); //return the current minutes
  };
});

//filter that parses the difference between dates to a human readable format (eg. 5 minutes ago, less than a minute ago)
/*NOTE that the current date must be passed in from the filter so as for the
$digest cycle to recognize a change in the time and refresh the filtered dates*/
MessageDate.filter('dateParser', function() {
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