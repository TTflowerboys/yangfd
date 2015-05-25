/**
 * Created by arnold on 15-5-25.
 */
angular.module('app')
    .directive('displayCountryName', function ($rootScope) {
        return {
            restrict: 'AE',
            template: '<div><span>{% name %}</span></div>',
            replace: true,
            scope: {
                model: '=displayCountryName'
            },
            link: function (scope) {
                if (scope.model) {
                    angular.forEach($rootScope.supportedCountries, function(value) {
                        if(value.value === scope.model){
                            scope.name = value.name
                        }
                    })
                }
            }
        }
    })
