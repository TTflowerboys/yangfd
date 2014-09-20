/**
 * Created by Michael on 14/9/20.
 */
angular.module('app')
    .directive('getCountry', function (enumApi) {
        return {
            restrict: 'AE',
            link: function (scope) {
                enumApi.getEnumsByType('country')
                    .success(function (data) {
                        scope.countries = data.val
                    })
            }
        }
    })
