/* Created by frank on 14-8-20. */
angular.module('app')
    .directive('oneScreen', function () {
        return {
            link: function (scope, elm, attrs) {
                $(elm).css('maxHeight', $(window).height() - $('#header').height())
                $(window).on('resize', function () {
                    $(elm).css('maxHeight', $(window).height() - $('#header').height())
                })
            }
        }
    })
