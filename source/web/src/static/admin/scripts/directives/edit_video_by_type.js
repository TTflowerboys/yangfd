/**
 * Created by Michael on 14/11/15.
 */
angular.module('app')
    .directive('editVideoByType', function ($rootScope, $filter, $upload, $http, i18nLanguages) {
        return {
            restrict: 'AE',
            templateUrl: '/static/admin/templates/edit_video_by_type.tpl.html',
            replace: true,
            scope: {
                sources: '=ngModel',
                host: '@host',
                type: '@type',
                tags:'@tags'
            },
            link: function (scope, elm, attrs) {
                if (!scope.video) {
                    scope.video = ''
                }
                scope.onFileSelected = function ($files) {
                    var file = $files[0]
                    if (file) {
                        if (scope.host === 'aws') {
                            scope.video = undefined
                            $upload.upload({
                                url: '/api/1/upload_file',
                                file: file,
                                fileFormDataName: 'data',
                                ignoreLoadingBar: true
                            }, {errorMessage: true})
                                .success(function (data, status, headers, config) {
                                    scope.video = data.val.url
                                    updateSource(scope.video)
                                })
                                .error(function () {
                                    scope.video = ''
                                })
                        } else {
                            scope.video = undefined
                            $upload.upload({
                                url: '/api/1/qiniu/upload_file',
                                file: file,
                                fileFormDataName: 'data',
                                ignoreLoadingBar: true
                            }, {errorMessage: true})
                                .success(function (data, status, headers, config) {
                                    scope.video = data.val.url
                                    updateSource(scope.video)
                                })
                                .error(function () {
                                    scope.video = ''
                                })
                        }
                    }
                }

                function updateSource(url) {
                    need_init = false
                    if (!scope.sources) {
                        scope.sources = []
                        scope.sources.push({url: url, host: scope.host, type: scope.type, tags: scope.tags})
                        return
                    }
                    var addFlag = true
                    for (var index in scope.sources) {
                        var type = scope.sources[index].type
                        var host = scope.sources[index].host
                        var tags = scope.sources[index].tags.toString()
                        if (type === scope.type && host === scope.host && tags === scope.tags) {
                            scope.sources[index].url = url
                            scope.sources[index].type = type
                            scope.sources[index].host = host
                            scope.sources[index].tags = tags
                            addFlag = false
                        }
                    }
                    if (addFlag) {
                        var source = {url: url, host: scope.host, type: scope.type, tags: scope.tags}
                        scope.sources.push(source)
                    }
                }

                scope.removeVideo = function () {
                    scope.video = ''
                    for (var index in scope.sources) {
                        var type = scope.sources[index].type
                        var host = scope.sources[index].host
                        var tags = scope.sources[index].tags.toString()
                        if (type === scope.type && host === scope.host && tags === scope.tags) {
                            scope.sources.splice(index, 1)
                        }
                    }
                }
                var need_init = true
                scope.$watch('sources', function (newValue) {
                    if (need_init) {
                        if (_.isEmpty(newValue)) {
                            return
                        }
                        for (var index in scope.sources) {
                            var type = scope.sources[index].type
                            var host = scope.sources[index].host
                            var tags = scope.sources[index].tags.toString()
                            if (type === scope.type && host === scope.host && tags === scope.tags) {
                                scope.video = scope.sources[index].url
                                scope.type = scope.sources[index].type
                                scope.host = scope.sources[index].host
                                scope.tags = scope.sources[index].tags.toString()
                            }
                        }
                        need_init = false
                    }
                })
            }
        }
    })