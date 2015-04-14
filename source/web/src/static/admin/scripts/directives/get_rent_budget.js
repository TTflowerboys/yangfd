/**
 * Created by Michael on 14/9/20.
 */
angular.module('app')
    .directive('getRentBudget', function (enumApi) {
        return {
            restrict: 'AE',
            link: function (scope) {
                enumApi.getEnumsByType('rent_budget')
                    .success(function (data) {
                        scope.rent_budget = data.val
                    })
            }
        }
    })
