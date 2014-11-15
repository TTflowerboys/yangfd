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
                type: '@type'
            },
            link: function (scope, elm, attrs) {

                scope.onFileSelected = function ($files) {
                    var file = $files[0]
                    if (file) {
                        if (scope.host === 'aws') {
                            $upload.upload({
                                url: '/api/1/upload_file',
                                file: file,
                                fileFormDataName: 'data',
                                ignoreLoadingBar: true
                            })
                                .success(function (data, status, headers, config) {
                                    scope.video = data.val.url
                                    updateSource(scope.video)
                                })
                        } else {
                            scope.video = undefined
                            $upload.upload({
                                url: '/api/1/qiniu/upload_file',
                                file: file,
                                fileFormDataName: 'data',
                                ignoreLoadingBar: true
                            })
                                .success(function (data, status, headers, config) {
                                    scope.video = data.val.url
                                    updateSource(scope.video)
                                })
                        }
                    }
                }

                function updateSource(url) {
                    if (!scope.sources) {
                        scope.sources = []
                        scope.sources.push({url: url, host: scope.host, type: scope.type})
                        return
                    }
                    var addFlag = true
                    for (var index in scope.sources) {
                        var type = scope.sources[index].type
                        var host = scope.sources[index].host
                        if (type === scope.type && host === scope.host) {
                            scope.sources[index].url = url
                            addFlag = false
                        }
                    }
                    if (addFlag) {
                        var source = {url: url, host: scope.host, type: scope.type}
                        scope.sources.push(source)
                    }
                }

                scope.removeVideo = function () {
                    scope.video = ''
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
                            if (type === scope.type && host === scope.host) {
                                scope.video = scope.source[index].url
                            }
                        }
                        need_init = false
                    }
                })
            }
        }
    })