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
                //scope.video = ''
                //
                //scope.onFileSelected = function ($files) {
                //    var file = $files[0]
                //    if (file) {
                //        scope.video = undefined
                //        $upload.upload({
                //            url: '/api/1/upload_file',
                //            file: file,
                //            fileFormDataName: 'data',
                //            ignoreLoadingBar: true
                //        })
                //            .success(function (data, status, headers, config) {
                //                scope.video = data.val.url
                //            })
                //    }
                //}
                //
                //scope.removeVideo = function () {
                //    scope.video = ''
                //}

                scope.addVideo = function(){
                    if(!scope.videoList){
                        scope.videoList = []
                    }
                    scope.videoList.push({})
                }
            }
        }
    })
