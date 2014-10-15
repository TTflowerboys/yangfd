/* Created by frank on 14-9-18. */
angular.module('app')
    .directive('editRegion', function ($rootScope, apiFactory) {
        return {
            restrict: 'AE',
            templateUrl: '/static/admin/templates/edit_region.tpl.html',
            scope: {
                country: '=country',
                city: '=city',
                zip: '=zip'
            },
            link: function (scope) {
                scope.userLanguage = $rootScope.userLanguage
//                var countryApi = apiFactory('geo/country')
//                var cityApi = apiFactory('geo/city')
//                countryApi.getAll()
//                    .then(function (response) {
//                        scope.countryList = response.data.val
//                    })
//                scope.$watch('country', function (value) {
//                    if (value) {
//                        cityApi.search({params: {country: value}})
//                            .then(function (response) {
//                                scope.cityList = response.data.val
//                            })
//                    } else {
//                        scope.cityList = []
//                    }
//                })
            }
        }
    })
