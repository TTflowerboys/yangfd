/**
 * Created by Michael on 14/9/24.
 */
angular.module('app')
    .directive('getCityByCountry', function (enumApi) {
        return {
            restrict: 'AE',
            scope: {
                country: '=country',
                cities:'=cities'
            },
            link: function (scope) {
                console.log(scope.country)

                scope.$watch('country', function (newValue) {
                    console.log(newValue)
                    if (newValue === undefined) {
                        return
                    }
                    enumApi.searchCityByCountryId(newValue)
                        .success(function (data) {
                            scope.cities = data.val
                        })
                })

            }
        }
    })