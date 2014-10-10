/* Created by frank on 14-8-18. */

angular.module('app')
    .directive('formatDate', function () {

        return {
            require: 'ngModel',
            link: function (scope, element, attrs, ctrl) {
                ctrl.$formatters.push(function (modelFormat) {
                    if (modelFormat) {
                        return new Date(modelFormat * 1000)
                    }
                })
                ctrl.$parsers.push(function (viewFormat) {
                    if (viewFormat) {
                        return parseInt((viewFormat - 0) / 1000, 10)
                    }
                })

            }
        }
    })
