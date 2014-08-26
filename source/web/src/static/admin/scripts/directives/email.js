/* Created by frank on 14-8-14. */
(function () {
    function drctEmail(scope, elm, attrs, ctrl) {
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

    angular.module('app')
        .directive('email', function () {
            return {
                require: 'ngModel',
                link: drctEmail
            }
        })
})()
