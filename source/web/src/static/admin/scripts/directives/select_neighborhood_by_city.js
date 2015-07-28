angular.module('app')
    .directive('selectNeighborhoodByCity', function ($rootScope, geonamesApi) {
        return {
            restrict: 'AE',
            templateUrl: '/static/admin/templates/select_neighborhood_by_city.tpl.html',
            scope: {
                selectedNeighborhood: '=ngModel',
                enumOption: '@text',
                city: '=city'
            },
            link: function (scope) {
                scope.$watch('city', function (newValue) {
                    if (_.isEmpty(newValue)) {
                        scope.neighborhoodList = []
                        scope.selectedCityId = undefined
                        return
                    }
                    var config = {}
                    config.params = {
                        'city':newValue,
                    }
                    geonamesApi.getNeighborhood(config)
                        .success(function (data) {
                            scope.neighborhoodList = data.val
                        })
                })

            }
        }
    })
