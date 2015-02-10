/**
 * Created by Michael on 14/9/20.
 */
angular.module('app')
    .directive('getBuildingArea', function (enumApi) {
        return {
            restrict: 'AE',
            link: function (scope) {
                enumApi.getEnumsByType('building_area')
                    .success(function (data) {
                        scope.building_area = data.val
                    })
            }
        }
    })
