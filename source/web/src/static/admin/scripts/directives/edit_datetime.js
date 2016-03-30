/**
 * Created by zhou on 15-1-29.
 */
angular.module('app')
    .directive('editDatetime', function () {
        return {
            restrict: 'AE',
            templateUrl: '/static/admin/templates/edit_datetime.tpl.html',
            replace: true,
            scope: {
                model: '=ngModel'
            },
            link: function (scope) {
                scope.display = scope.model ? new Date(scope.model * 1000) : null
                scope.$watch('model', function (value) {
                    if(_.isNumber(value)) {
                        scope.display = value * 1000
                    }
                })
                var watchCanceler = scope.$watch('display', function (newValue) {
                    scope.model = parseInt((newValue - 0) / 1000, 10)
                })

                scope.$on('$destroy', function () {
                    watchCanceler()
                })
            }
        }
    })
