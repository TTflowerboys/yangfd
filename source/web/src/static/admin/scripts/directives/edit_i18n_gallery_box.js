/**
 * Created by zhou on 14-11-6.
 */
angular.module('app')
    .directive('editI18nGalleryBox', function ($rootScope, $filter, $upload) {
        return {
            restrict: 'AE',
            templateUrl: '/static/admin/templates/edit_i18n_gallery_box.tpl.html',
            replace: true,
            scope: {
                images: '=editI18nGalleryBox',
                widthLimit: '@widthLimit',
                ratio: '@ratio',
                thumbnailSize: '@thumbnailSize',
                text: '@text'
            },
            link: function (scope, elm, attrs) {
                scope.userLanguage = $rootScope.userLanguage
                var carouselLinks = [],
                    linksContainer = $('#links'),
                    baseUrl;
                scope.$watch('images[userLanguage.value]', function (newValue) {
                    if (!newValue) {
                        return
                    }
                    linksContainer.children().remove()
                    $.each(newValue, function (index, photo) {
                        baseUrl = photo
                        $('<a/>')
                            .append($('<img width="120px" height="100px">').prop('src', $filter('thumbnail')(baseUrl)))
                            .prop('href', baseUrl)
                            .prop('title', index + 1)
                            .attr('data-gallery', '')
                            .appendTo(linksContainer);
                        carouselLinks.push({
                            href: baseUrl,
                            title: 'abc'
                        });
                    });
                })

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
                        scope.fileNames.push(file.name)
                        scope.images.push('')
                        $upload.upload({
                            url: '/api/1/upload_image',
                            file: file,
                            fileFormDataName: 'data',
                            data: {
                                width_limit: scope.widthLimit || 0,
                                ratio: scope.ratio || 0,
                                thumbnail_size: scope.thumbnailSize || '0,0',
                                filename: file.name
                            },
                            ignoreLoadingBar: true
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
            }
        }
    })
