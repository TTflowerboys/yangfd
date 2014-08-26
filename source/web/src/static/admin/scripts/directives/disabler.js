/* Created by frank on 14-8-18. */
angular.module('app')
    .directive('bbgDisabler', function () {
        return {
            link: function (scope, elm, attrs) {
                var initialValue = elm.prop('value')
                scope.$watch(attrs.bbgDisabler, function (value) {
                    if (value) {
                        elm.val('Loading...')
                        elm.prop('disabled', true)
                    } else {
                        elm.val(initialValue)
                        elm.prop('disabled', false)
                    }
                })
            }
        }
    })
