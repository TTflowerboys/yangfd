/**
 * Created by Michael on 14/9/20.
 */
angular.module('app')
    .directive('getCities', function (enumApi) {
        return {
            restrict: 'AE',
            link: function (scope) {
                enumApi.getEnumsByType('city')
                    .success(function (data) {
                        scope.cities = data.val
                    })
            }
        }
    })
