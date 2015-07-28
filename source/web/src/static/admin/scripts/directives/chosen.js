angular.module('app')
    .directive('chosen', function ($rootScope) {
        return {
            restrict: 'AE',
            link: function (scope, iElement) {
                $(iElement).chosen({width: '100%', disable_search_threshold: 8 })
                scope.$watch(iElement.attr('chosen-list'), function () {
                    setTimeout(function () {
                        $(iElement).trigger('chosen:updated')
                    }, 200)
                })
            }
        }
    })
