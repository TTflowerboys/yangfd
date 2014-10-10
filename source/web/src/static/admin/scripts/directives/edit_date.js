/* Created by frank on 14-8-21. */
angular.module('app')
    .directive('editDate', function () {
        return {
            restrict: 'AE',
            templateUrl: '/static/admin/templates/date_edit.tpl.html',
            replace: true,
            scope: {
                model: '=ngModel'
            },
            link: function (scope) {
                scope.display = scope.model ? new Date(scope.model * 1000) : null

                var watchCanceler = scope.$watch('display', function (newValue) {
                    scope.model = parseInt((newValue - 0) / 1000, 10)
                })

                scope.$on('$destroy', function () {
                    watchCanceler()
                })
            }
        }
    })
