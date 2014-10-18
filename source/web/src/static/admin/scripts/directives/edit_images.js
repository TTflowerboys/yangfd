/* Created by frank on 14-8-21. */
angular.module('app')
    .directive('editImages', function ($upload) {
        return {
            restrict: 'AE',
            templateUrl: '/static/admin/templates/edit_images.tpl.html',
            replace: true,
            scope: {
                images: '=ngModel',
                widthLimit: '@widthLimit',
                ratio: '@ratio',
                thumbnailSize: '@thumbnailSize',
                text: '@text'
            },
            link: function (scope, elm, attrs) {

                if (!scope.widthLimit) {
                    throw 'Needs width-limit'
                }
                if (!scope.ratio) {
                    throw 'Needs ratio'
                }
                if (!scope.thumbnailSize) {
                    throw 'Needs thumbnail-size'
                }
                if (!scope.text) {
                    throw 'Needs text'
                }

                scope.onFileSelected = function ($files) {
                    var file = $files[0]
                    if (file) {
                        if (!scope.images) {
                            scope.images = []
                        }
                        if (!scope.fileNames) {
                            scope.fileNames = []
                        }
                        scope.fileNames.push(file.name)
                        scope.images.push('')
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
                                for (var key in scope.images) {
                                    if (file.name === scope.fileNames[key]) {
                                        scope.images[key] = data.val.url
                                        break
                                    }
                                }
                            })
                    }
                }
                scope.removeImage = function (imageIndex) {
                    scope.images.splice(imageIndex, 1)
                    scope.fileNames.splice(imageIndex, 1)
                }
            }
        }
    })
