/**
 * Created by zhou on 14-11-6.
 */
angular.module('app')
    .directive('editGalleryBox', function ($rootScope, $filter, $upload, $http, growl, imageUploadSites) {
        return {
            restrict: 'AE',
            templateUrl: '/static/admin/templates/edit_gallery_box.tpl.html',
            replace: true,
            scope: {
                images: '=editGalleryBox',
                widthLimit: '@widthLimit',
                ratio: '@ratio',
                thumbnailSize: '@thumbnailSize',
                text: '@text',
                cover: '=cover',
                watermark: '@watermark'
            },
            link: function (scope, elm, attrs) {

                scope.onFileSelected = function ($files) {
                    var file = $files[0]
                    if (file) {
                        if (!scope.images) {
                            scope.images = []
                        }
                        if (!scope.fileNames) {
                            scope.fileNames = []
                            for (var i = 0; i < scope.images.length; i += 1) {
                                scope.fileNames.push('')
                            }
                        }
                        var currentFileName = file.name + parseInt((new Date() - 0) / 1000, 10)
                        scope.fileNames.push(currentFileName)
                        scope.images.push('')
                        $upload.upload({
                            url: '/api/1/upload_image',
                            file: file,
                            fileFormDataName: 'data',
                            data: {
                                width_limit: scope.widthLimit || 0,
                                ratio: scope.ratio || 0,
                                thumbnail_size: scope.thumbnailSize || '0,0',
                                filename: currentFileName,
                                watermark: scope.watermark
                            },
                            ignoreLoadingBar: true,
                            errorMessage: true
                        })
                            .success(function (data, status, headers, config) {
                                for (var key in scope.images) {
                                    if (currentFileName === scope.fileNames[key]) {
                                        scope.images[key] = data.val.url
                                        break
                                    }
                                }
                            }).error(function (data) {
                                if (!data) {
                                    growl.addErrorMessage($rootScope.renderHtml('No Response'), {enableHtml: true})
                                }
                                for (var key in scope.images) {
                                    if (currentFileName === scope.fileNames[key]) {
                                        scope.images.splice(key, 1)
                                        scope.fileNames.splice(key, 1)
                                        break
                                    }
                                }
                            })
                    }
                }

                scope.isOurImage = function (img) {
                    if (_.isEmpty(img)) {
                        return false
                    }
                    return img.indexOf(imageUploadSites[0]) < 0 &&
                        img.indexOf(imageUploadSites[1]) < 0 &&
                        img.indexOf(imageUploadSites[2]) < 0
                }

                scope.removeImage = function (imageIndex) {
                    scope.images.splice(imageIndex, 1)
                    //TODO: handle this error
                    scope.fileNames.splice(imageIndex, 1)
                }

                scope.uploadImage = function (img) {
                    return $http.post('/api/1/upload_from_url', {
                        link: img,
                        width_limit: scope.widthLimit || 0,
                        ratio: scope.ratio || 0,
                        thumbnail_size: scope.thumbnailSize || '0,0',
                        watermark: scope.watermark
                    }, {errorMessage: true})
                        .success(function (data, status, headers, config) {
                            for (var key in scope.images) {
                                if (img === scope.images[key]) {
                                    scope.images[key] = data.val.url
                                    break
                                }
                            }
                        })
                }

                scope.isNotCover = function (imageIndex) {
                    if (!scope.cover || !scope.cover) {
                        return true
                    }
                    return scope.cover !== scope.images[imageIndex]
                }

                scope.setCover = function (imageIndex) {
                    if (!scope.cover) {
                        scope.cover = {}
                    }
                    scope.cover = scope.images[imageIndex]
                }
            }
        }
    })
