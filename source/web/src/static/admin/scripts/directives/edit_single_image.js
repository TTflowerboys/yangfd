/* Created by frank on 14-8-21. */
angular.module('app')
    .directive('editSingleImage', function ($upload, $http, $rootScope, growl) {
        return {
            restrict: 'AE',
            templateUrl: '/static/admin/templates/edit_single_image.tpl.html',
            replace: true,
            scope: {
                image: '=ngModel',
                widthLimit: '@widthLimit',
                ratio: '@ratio',
                thumbnailSize: '@thumbnailSize',
                text: '@text',
                watermark: '@watermark'
            },
            link: function (scope, elm, attrs) {
                if (!scope.image) {
                    scope.image = ''
                }
                scope.onFileSelected = function ($files) {
                    var file = $files[0]
                    if (file) {
                        scope.image = undefined
                        $upload.upload({
                            url: '/api/1/upload_image',
                            file: file,
                            fileFormDataName: 'data',
                            data: {
                                width_limit: scope.widthLimit || 0,
                                ratio: scope.ratio || 0,
                                thumbnail_size: scope.thumbnailSize || '0,0',
                                filename: file.name,
                                watermark:scope.watermark
                            },
                            ignoreLoadingBar: true,
                            errorMessage: true
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
                scope.removeImage = function () {
                    scope.image = ''
                }
                scope.isOurImage = function (img) {
                    if (_.isEmpty(img)) {
                        return false
                    }
                    return img.indexOf('bbt-currant.s3.amazonaws.com') < 0 || img.indexOf('7vih1w.com2.z0.glb.qiniucdn.com') < 0
                }

                scope.uploadImage = function (img) {
                    return $http.post('/api/1/upload_from_url', {
                        link: img,
                        width_limit: scope.widthLimit || 0,
                        ratio: scope.ratio || 0,
                        thumbnail_size: scope.thumbnailSize || '0,0',
                        watermark:scope.watermark
                    }, {errorMessage: true})
                        .success(function (data, status, headers, config) {
                            scope.image = data.val.url
                        })
                }
            }
        }
    })
