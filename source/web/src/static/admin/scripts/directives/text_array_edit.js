/* Created by frank on 14-8-23. */
angular.module('app')
    .directive('textArrayEdit', function ($upload) {
        return {
            restrict: 'AE',
            templateUrl: '/static/admin/templates/text_array_edit.tpl.html',
            replace: true,
            scope: {
                textArray: '=ngModel'
            },
            link: function (scope, elm, attrs) {
                scope.onAdd = function (text) {
                    if (!text) {
                        return
                    }
                    if (!scope.textArray) {
                        scope.textArray = []
                    }
                    scope.textArray.push(text)
                    scope.newText = ''

                }
                scope.onRemove = function (index) {
                    scope.textArray.splice(index, 1)
                }
            }
        }
    })

