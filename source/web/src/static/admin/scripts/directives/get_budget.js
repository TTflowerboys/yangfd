/**
 * Created by Michael on 14/9/20.
 */
angular.module('app')
    .directive('getBudget', function (enumApi) {
        return {
            restrict: 'AE',
            link: function (scope) {
                enumApi.getEnumsByType('budget')
                    .success(function (data) {
                        scope.budget = data.val
                    })
            }
        }
    })
