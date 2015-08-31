angular.module('app')
    .directive('tooltip', function ($rootScope) {
        return {
            restrict: 'AE',
            controller: function ($scope, $element, $rootScope, $compile) {
                $scope.tooltip = function () {
                    setTimeout(function () {
                        $element.tooltip({
                            title: $element.attr('data-title')
                        })
                    }, 200)
                }

            },
            link: function (scope, elem) {
                scope.tooltip()
            }
        }
    })
