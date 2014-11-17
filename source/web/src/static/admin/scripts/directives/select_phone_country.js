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
                enumId: '=ngModel',
                enumOption: '@text'
            },
            link: function (scope) {
                scope.getCodeBySlug = function (country, slug) {
                    if (slug === 'CN') {
                        return '(+86) ' + country
                    } else if (slug === 'GB') {
                        return '(+44) ' + country
                    } else if (slug === 'US') {
                        return '(+1) ' + country
                    } else if (slug === 'HK') {
                        return '(+852) ' + country
                    }
                    return country
                }
                enumApi.getEnumsByType('country')
                    .success(function (data) {
                        scope.enumList = data.val
                    })

            }
        }
    })
