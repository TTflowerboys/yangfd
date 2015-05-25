/**
 * Created by Michael on 14/9/24.
 */
angular.module('app')
    .directive('selectCityByCountry', function ($rootScope, geonamesApi) {
        return {
            restrict: 'AE',
            templateUrl: '/static/admin/templates/select_city_by_country.tpl.html',
            scope: {
                selectedCityId: '=ngModel',
                enumOption: '@text',
                country: '=country'
            },
            link: function (scope) {
                scope.$watch('country', function (newValue) {
                    if (_.isEmpty(newValue)) {
                        scope.cityList = []
                        scope.selectedCityId = undefined
                        return
                    }
                    var config = {}
                    config.params = {
                        'country':newValue,
                        'feature_code':'city'
                    }
                    geonamesApi.get(config)
                        .success(function (data) {
                            scope.cityList = data.val
                        })
                })

            }
        }
    })
