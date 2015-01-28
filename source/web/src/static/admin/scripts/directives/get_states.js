/**
 * Created by Michael on 14/9/20.
 */
angular.module('app')
    .directive('getStates', function (enumApi) {
        return {
            restrict: 'AE',
            link: function (scope) {
                enumApi.getEnumsByType('state')
                    .success(function (data) {
                        scope.states = data.val
                    })
            }
        }
    })
