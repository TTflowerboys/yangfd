/* Created by frank on 14-8-14. */
angular.module('app')
    .directive('validateEmail', function () {
        return {
            require: 'ngModel',
            link: function (scope, elm, attrs, ctrl) {
                ctrl.$parsers.unshift(function (viewValue) {
                    if (viewValue.indexOf('@') >= 0) {
                        ctrl.$setValidity('email', true)
                        return viewValue
                    } else {
                        ctrl.$setValidity('email', false)
                        return undefined
                    }
                })

            }
        }
    })
