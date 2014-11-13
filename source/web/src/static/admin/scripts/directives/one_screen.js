/* Created by frank on 14-8-20. */
angular.module('app')
    .directive('oneScreen', function () {
        return {
            link: function (scope, elm, attrs) {

                recalculateMinHeight()

                $(window).on('resize', recalculateMinHeight)

                function recalculateMinHeight() {
                    var $elm = $(elm)
                    //var siblingsHeight = 0
                    //$elm.siblings().each(function (index, dom) {
                    //    siblingsHeight += $(dom).height()
                    //})
                    $elm.css({minHeight: $(window).height()})

                }
            }
        }
    })
