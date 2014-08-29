/* Created by frank on 14-8-29. */
angular.module('app')
    .directive('checkPhone', function ($upload) {
        return {
            restrict: 'AE',
            link: function (scope, elm, attrs) {
                console.log(scope)
            }
        }
    })

