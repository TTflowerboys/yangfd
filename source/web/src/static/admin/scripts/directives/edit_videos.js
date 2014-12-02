/**
 * Created by Michael on 14/11/15.
 */
angular.module('app')
    .directive('editVideos', function ($rootScope, $filter, $upload, $http, i18nLanguages) {
        return {
            restrict: 'AE',
            templateUrl: '/static/admin/templates/edit_videos.tpl.html',
            replace: true,
            scope: {
                videoList: '=editVideos',
                text: '@text'
            },
            link: function (scope, elm, attrs) {

                scope.addVideo = function(){
                    if(!scope.videoList){
                        scope.videoList = []
                    }
                    scope.videoList.push({})
                }
            }
        }
    })
