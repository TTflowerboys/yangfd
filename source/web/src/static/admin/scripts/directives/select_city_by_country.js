/**
 * Created by Michael on 14/9/24.
 */
angular.module('app')
    .directive('selectCityByCountry', function ($rootScope, enumApi) {
        return {
            restrict: 'AE',
            templateUrl: '/static/admin/templates/enum_select.tpl.html',
            scope: {
                enumId: '=ngModel',
                enumOption: '@text',
                country: '=country',
            },
            link: function (scope) {
                scope.userLanguage = $rootScope.userLanguage
                scope.$watch('country', function (newValue) {
                    if (newValue === undefined) {
                        return
                    }
                    enumApi.searchCityByCountryId(newValue)
                        .success(function (data) {
                            scope.enumList = data.val
                        })
                })

            }
        }
    })
