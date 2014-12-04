/**
 * Created by Michael on 14/10/16.
 */
angular.module('app')
    .directive('getUploadFileName', function ($upload) {
        return {
            restrict: 'AE',
            templateUrl: '/static/admin/templates/get_upload_file_name.tpl.html',
            replace: true,
            scope: {
                widthLimit: '@widthLimit',
                ratio: '@ratio',
                thumbnailSize: '@thumbnailSize',
                text: '@text'
            },
            link: function (scope, elm, attrs) {
                scope.onFileSelected = function ($files) {
                    var file = $files[0]
                    if (file) {
                        $upload.upload({
                            url: '/api/1/upload_image',
                            file: file,
                            fileFormDataName: 'data',
                            data: {
                                width_limit: scope.widthLimit || 1920,
                                ratio: scope.ratio || 1,
                                thumbnail_size: scope.thumbnailSize || '400,400',
                                filename: file.name,
                                ignoreLoadingBar: true,
                                errorMessage: true
                            }
                        })
                            .success(function (data, status, headers, config) {
                                scope.image = data.val.url
                            }).error(function (data) {
                                if (!data) {
                                    growl.addErrorMessage($rootScope.renderHtml('No Response'), {enableHtml: true})
                                }
                            })
                    }
                }
            }
        }
    })
