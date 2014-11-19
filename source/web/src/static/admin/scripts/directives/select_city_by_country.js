/**
 * Created by Michael on 14/9/24.
 */
angular.module('app')
    .directive('selectCityByCountry', function ($rootScope, enumApi) {
        return {
            restrict: 'AE',
            templateUrl: '/static/admin/templates/select_enum.tpl.html',
            scope: {
                enumId: '=ngModel',
                enumOption: '@text',
                country: '=country'
            },
            link: function (scope) {
                scope.userLanguage = $rootScope.userLanguage
                scope.$watch('country', function (newValue) {
                    if (_.isEmpty(newValue)) {
                        scope.enumList = []
                        scope.enumId = ''
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
