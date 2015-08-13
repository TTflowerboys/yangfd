angular.module('app')
    .directive('selectNeighborhoodByCity', function ($rootScope, geonamesApi) {
        return {
            restrict: 'AE',
            templateUrl: '/static/admin/templates/select_neighborhood_by_city.tpl.html',
            scope: {
                selectedNeighborhood: '=ngModel',
                enumOption: '@text',
                city: '=city',
                cityName: '=cityName'
            },
            link: function (scope) {
                
                scope.$watch('city', function (newValue) {
                    if (_.isEmpty(newValue)) {
                        scope.neighborhoodList = []
                        scope.selectedNeighborhood = undefined
                        return
                    }
                    var config = {}
                    config.params = {
                        'city':newValue.id,
                    }
                    if(scope.cityName && scope.cityName.toLowerCase() === 'london') {
                        geonamesApi.getNeighborhood(config)
                            .success(function (data) {
                                scope.neighborhoodList = data.val
                            })
                    }
                })

            }
        }
    })
