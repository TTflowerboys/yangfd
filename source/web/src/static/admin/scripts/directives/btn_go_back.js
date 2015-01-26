/**
 * Created by zhou on 15-1-26.
 */
angular.module('app')
    .directive('btnGoBack', function ($state, $stateParams) {
        return {
            restrict: 'C',
            link: function (scope, element) {

                $(element).click(function (e) {
                    $state.go($stateParams.from || '^')
                });
            }
        }
    })
