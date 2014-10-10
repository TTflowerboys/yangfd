/* Created by frank on 14-8-21. */
angular.module('app')
    .directive('editSingleImage', function ($upload) {
        return {
            restrict: 'AE',
            templateUrl: '/static/admin/templates/single_image_edit.tpl.html',
            replace: true,
            scope: {
                image: '=ngModel',
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
                                filename: file.name
                            }
                        })
                            .success(function (data, status, headers, config) {
                                scope.image = data.val.url
                            })
                    }
                }
                scope.removeImage = function (imageIndex) {
                    scope.image = ''
                }
            }
        }
    })
