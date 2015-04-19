//This script includes both the AngularJS directives and Jquery functions used solely for the User expirience
var UX=angular.module('UX',[]);

//executes the send function when the enter button is pressed within a text area
UX.directive('ngEnter', function () {
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

//Toggles the left and right panes for better experience on mobiles that can't view everything all at once.
var leftPane=true;
$("#left-pane-toggle").click(function(){
  if(leftPane){
    $("#left-pane").css("display","none");
    $("#left-pane-toggle span").removeClass("glyphicon-chevron-left");
    $("#left-pane-toggle span").addClass("glyphicon-chevron-right");
    $("#left-pane-toggle").css("background-color","transparent");
    leftPane=false;
  }
  else{
    $("#left-pane").css("display","inline-block");
    $("#left-pane-toggle span").removeClass("glyphicon-chevron-right");
    $("#left-pane-toggle span").addClass("glyphicon-chevron-left");
    $("#left-pane-toggle").css("background-color","rgba(255,255,255,1)");
    leftPane=true;
  }
});

var rightPane=false;
$("#right-pane-toggle").click(function(){
  if(rightPane){
    $("#right-pane").css("display","none");
    $("#right-pane-toggle span").removeClass("glyphicon-chevron-right");
    $("#right-pane-toggle span").addClass("glyphicon-chevron-left");
    $("#right-pane-toggle").css("background-color","transparent");
    rightPane=false;
  }
  else{
    $("#right-pane").css("display","inline-block");
    $("#right-pane-toggle span").removeClass("glyphicon-chevron-left");
    $("#right-pane-toggle span").addClass("glyphicon-chevron-right");
    $("#right-pane-toggle").css("background-color","rgba(255,255,255,1)");
    rightPane=true;
  }
});

(function($){
  $(window).load(function(){
    $("#conversation").mCustomScrollbar();
    $(".chat-room-list").mCustomScrollbar();
    $(".channel-list").mCustomScrollbar();
  });
})(jQuery);