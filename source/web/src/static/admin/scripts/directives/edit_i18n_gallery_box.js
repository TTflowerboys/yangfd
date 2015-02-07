/**
 * Created by zhou on 14-11-6.
 */
angular.module('app')
    .directive('editI18nGalleryBox', function ($rootScope, $filter, $upload, $http, growl) {
        return {
            restrict: 'AE',
            templateUrl: '/static/admin/templates/edit_i18n_gallery_box.tpl.html',
            replace: true,
            scope: {
                images: '=editI18nGalleryBox',
                widthLimit: '@widthLimit',
                ratio: '@ratio',
                thumbnailSize: '@thumbnailSize',
                text: '@text',
                cover: '=cover',
                watermark: '@watermark'
            },
            link: function (scope, elm, attrs) {
                scope.userLanguage = $rootScope.userLanguage

                scope.onFileSelected = function ($files) {
                    var file = $files[0]
                    var currentLanguage = scope.userLanguage.value
                    if (file) {
                        if (!scope.images[currentLanguage]) {
                            scope.images[currentLanguage] = []
                        }
                        if (!scope.fileNames[currentLanguage]) {
                            scope.fileNames[currentLanguage] = []
                            for (var i = 0; i < scope.images[currentLanguage].length; i += 1) {
                                scope.fileNames[currentLanguage].push('')
                            }
                        }
                        scope.fileNames[currentLanguage].push(file.name)
                        scope.images[currentLanguage].push('')
                        $upload.upload({
                            url: '/api/1/upload_image',
                            file: file,
                            fileFormDataName: 'data',
                            data: {
                                width_limit: scope.widthLimit || 0,
                                ratio: scope.ratio || 0,
                                thumbnail_size: scope.thumbnailSize || '0,0',
                                filename: file.name,
                                watermark: scope.watermark
                            },
                            ignoreLoadingBar: true,
                            errorMessage: true
                        })
                            .success(function (data, status, headers, config) {
                                for (var key in scope.images[currentLanguage]) {
                                    if (file.name === scope.fileNames[currentLanguage][key]) {
                                        scope.images[currentLanguage][key] = data.val.url
                                        break
                                    }
                                }
                            }).error(function (data) {
                                if (!data) {
                                    growl.addErrorMessage($rootScope.renderHtml('No Response'), {enableHtml: true})
                                }
                            })
                    }
                }

                scope.onCopyClick = function () {
                    var copyItem = scope.images[scope.userLanguage.value]
                    for (var index in $rootScope.i18nLanguages) {
                        var itemLanguage = $rootScope.i18nLanguages[index].value
                        if (scope.userLanguage.value !== itemLanguage) {
                            if (!scope.images[itemLanguage]) {
                                scope.images[itemLanguage] = []
                            }
                            scope.images[itemLanguage] = _.uniq(scope.images[itemLanguage].concat(copyItem))
                        }
                    }
                }

                scope.isOurImage = function (img) {
                    if (_.isEmpty(img)) {
                        return false
                    }
                    return img.indexOf('bbt-currant.s3.amazonaws.com') < 0 || img.indexOf('7vih1w.com2.z0.glb.qiniucdn.com') < 0
                }

                scope.removeImage = function (imageIndex) {
                    scope.images[scope.userLanguage.value].splice(imageIndex, 1)
                    scope.fileNames[scope.userLanguage.value].splice(imageIndex, 1)
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
                            for (var key in scope.images[scope.userLanguage.value]) {
                                if (img === scope.images[scope.userLanguage.value][key]) {
                                    scope.images[scope.userLanguage.value][key] = data.val.url
                                    break
                                }
                            }
                        })
                }

                scope.isNotCover = function (imageIndex) {
                    if (!scope.cover || !scope.cover[scope.userLanguage.value]) {
                        return true
                    }
                    return scope.cover[scope.userLanguage.value] !== scope.images[scope.userLanguage.value][imageIndex]
                }

                scope.setCover = function (imageIndex) {
                    if (!scope.cover) {
                        scope.cover = {}
                    }
                    scope.cover[scope.userLanguage.value] = scope.images[scope.userLanguage.value][imageIndex]
                }
            }
        }
    })
