/**
 * Created by Arnold on 15/05/25.
 */
angular.module('app')
    .directive('selectSupportedCountry', function ($rootScope, enumApi) {
        return {
            restrict: 'AE',
            templateUrl: '/static/admin/templates/select_supported_country.tpl.html',
            replace: true,
            scope: {
                selectedCountry: '=ngModel',
                enumOption: '@text'
            },
            link: function (scope) {
                scope.supportedCountries = $rootScope.supportedCountries
            }
        }
    })
