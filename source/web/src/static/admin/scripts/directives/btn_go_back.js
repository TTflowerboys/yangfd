/**
 * Created by zhou on 15-1-26.
 */
angular.module('app')
    .directive('btnGoBack', function ($state, $stateParams) {
        return {
            restrict: 'C',
            link: function (scope, element) {
                scope.onBackClick = function(){
                    $state.go($stateParams.from || '^', $stateParams.fromParams)
                }
            }
        }
    })
