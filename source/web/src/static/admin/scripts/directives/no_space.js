/* Created by frank on 14-8-14. */
(function () {
    function drctNoSpace(scope, elm, attrs, ctrl) {
        ctrl.$formatters.push(function (modelFormat) {
            if (modelFormat) {
                return modelFormat.replace(/_/g, ' ')
            }
        })
        ctrl.$parsers.push(function (viewFormat) {
            if (viewFormat) {
                return viewFormat.replace(/ /g, '_')
            }
        })

    }


    /* Created by frank on 14-8-18. */

    angular.module('app')
        .directive('noSpace', function () {
            return {
                require: 'ngModel',
                link: drctNoSpace
            }
        })
        .filter('convert2space', function () {
            return function (input, from) {
                var regex = new RegExp(from, 'g')
                if (input.constructor === Array) {
                    return input.map(function (item) {
                        return  (item && item.replace) ? item.replace(regex, ' ') : item
                    })
                }
                return (input && input.replace) ? input.replace(regex, ' ') : input
            };
        });

})()
