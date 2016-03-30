/* Created by frank on 14-8-21. */
angular.module('app')
    .directive('editDate', function ($timeout) {
        return {
            restrict: 'AE',
            templateUrl: '/static/admin/templates/edit_date.tpl.html',
            replace: true,
            scope: {
                model: '=ngModel',
                placeholder: '@placeholder',
                startDate: '=?'
            },
            link: function (scope) {
                scope.display = scope.model ? new Date(scope.model * 1000) : null
                scope.$watch('model', function (value) {
                    if(_.isNumber(value)) {
                        scope.display = value * 1000
                    }
                })
                var watchCanceler = scope.$watch('display', function (newValue) {
                    if(newValue) {
                        scope.model = parseInt((newValue - 0) / 1000, 10)
                    }
                })

                scope.dateDisabled = function (date, mode) {
                    return scope.startDate ? date.getTime() / 1000 < scope.startDate : false
                }

                scope.$watch('startDate', function (newValue) {
                    var tmp = scope.display
                    scope.display = ''
                    $timeout(function () {
                        scope.display = tmp
                    })
                })

                scope.$on('$destroy', function () {
                    watchCanceler()
                })
            }
        }
    })
