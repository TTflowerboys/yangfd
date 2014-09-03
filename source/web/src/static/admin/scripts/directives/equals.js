/* Created by frank on 14-9-3. */

angular.module('app')
    .directive('equals', function () {
        return {
            restrict: 'AE',
            require: 'ngModel',
            scope: {
                target: '=ngEquals'
            },
            link: function (scope, elm, attrs, ngModel) {
                ngModel.$parsers.unshift(function (value) {
                    ngModel.$setValidity('equals', scope.target === value)
                    return value
                })
            }
        }
    })
