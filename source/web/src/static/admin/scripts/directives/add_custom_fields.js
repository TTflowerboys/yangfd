/**
 * Created by Michael on 14/9/26.
 */
angular.module('app')
    .directive('addCustomFields', function () {
        return {
            restrict: 'AE',
            link: function (scope) {

                scope.addCustomFields = function () {
                    if (!scope.item.custom_fields) {
                        scope.item.custom_fields = []
                    }
                    var temp = {key: scope.item.tempKey, value: scope.item.tempValue}
                    scope.item.custom_fields.push(angular.copy(temp))
                    scope.item.tempKey = undefined
                    scope.item.tempValue = undefined
                }
            }
        }
    })