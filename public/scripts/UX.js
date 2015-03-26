//This module has everything to do with the filters and directives responsible for the user experience
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
