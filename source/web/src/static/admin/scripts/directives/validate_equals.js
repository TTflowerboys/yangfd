/* Created by frank on 14-9-3. */

angular.module('app')
    .directive('validateEquals', function () {
        return {
            restrict: 'AE',
            require: 'ngModel',
            scope: {
                equals: '=equals'
            },
            link: function (scope, elm, attrs, ngModel) {
                ngModel.$parsers.unshift(function (value) {
                    ngModel.$setValidity('equals', scope.equals === value)
                    return value
                })
            }
        }
    })
