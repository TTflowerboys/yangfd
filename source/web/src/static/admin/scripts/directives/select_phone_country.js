/**
 * Created by Michael on 14/10/13.
 */
angular.module('app')
    .directive('selectPhoneCountry', function ($rootScope, enumApi) {
        return {
            restrict: 'AE',
            templateUrl: '/static/admin/templates/select_phone_country.tpl.html',
            replace: true,
            scope: {
                selectedCountry: '=ngModel',
                enumOption: '@text'
            },
            link: function (scope) {
                scope.supportedCountries = $rootScope.supportedCountries

                scope.getDisplayNameBycode = function (country, code) {
                    if (code === 'CN') {
                        return '(+86) ' + country
                    } else if (code === 'GB') {
                        return '(+44) ' + country
                    } else if (code === 'US') {
                        return '(+1) ' + country
                    } else if (code === 'HK') {
                        return '(+852) ' + country
                    }
                    return country
                }
            }
        }
    })
