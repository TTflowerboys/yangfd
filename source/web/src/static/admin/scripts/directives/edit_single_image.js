/* Created by frank on 14-8-21. */
angular.module('app')
    .directive('editSingleImage', function ($upload, $http) {
        return {
            restrict: 'AE',
            templateUrl: '/static/admin/templates/edit_single_image.tpl.html',
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
                                width_limit: scope.widthLimit || 0,
                                ratio: scope.ratio || 0,
                                thumbnail_size: scope.thumbnailSize || '0,0',
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
                scope.isOurImage = function (img) {
                    return img.indexOf('bbt-currant.s3.amazonaws.com') < 0
                }

                scope.uploadImage = function (img) {
                    return $http.post('/api/1/upload_from_url', {
                        link: img,
                        width_limit: scope.widthLimit || 0,
                        ratio: scope.ratio || 0,
                        thumbnail_size: scope.thumbnailSize || '0,0'
                    }, {errorMessage: true})
                        .success(function (data, status, headers, config) {
                            scope.image = data.val.url
                        })
                }
            }
        }
    })
