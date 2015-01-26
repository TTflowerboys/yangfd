/**
 * Created by zhou on 15-1-26.
 */
angular.module('app')
    .directive('btnRequestSequence', function ($state, $rootScope) {
        return {
            restrict: 'C',
            link: function (scope, element) {
                var count =0
                scope.$on('cfpLoadingBar:loading', function ($event, channel) {
                    setTimeout(function () {
                        scope.$evalAsync(function () {
                            count++
                            $(element).attr('disabled','disabled');
                        });
                    }, 0);
                })

                scope.$on('cfpLoadingBar:loaded', function ($event, channel) {
                    setTimeout(function () {
                        scope.$evalAsync(function () {
                            if(--count===0) {
                                $(element).removeAttr('disabled');
                            }
                        });
                    }, 0);
                })

            }
        }
    })
