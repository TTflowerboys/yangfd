/**
 * Created by chaowang on 9/23/14.
 */
angular.module('app')
    .directive('onEnter', function () {
    return function (scope, element, attrs) {
        element.bind('keydown keypress', function (event) {
            // Handle Enter Press Event
            if(event.which === 13) {
                scope.$apply(function (){
                    scope.$eval(attrs.onEnter);
                });

                event.preventDefault();
            }
        });
    };
});