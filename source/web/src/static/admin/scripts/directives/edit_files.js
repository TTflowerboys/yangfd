/**
 * Created by Michael on 14/9/9.
 */
angular.module('app')
    .directive('editFiles', function ($upload, $rootScope, growl) {
        return {
            restrict: 'AE',
            templateUrl: '/static/admin/templates/edit_files.tpl.html',
            replace: true,
            scope: {
                files: '=ngModel',
                text: '@text'
            },
            link: function (scope, elm, attrs) {

                scope.onFileSelected = function ($files) {
                    var file = $files[0]
                    if (file) {
                        if (!scope.files) {
                            scope.files = []
                        }
                        scope.files.push({url: '', description: file.name})
                        var url = '/api/1/upload_file'
                        $upload.upload({
                            url: url,
                            file: file,
                            fileFormDataName: 'data',
                            ignoreLoadingBar: true,
                            errorMessage: true
                        })
                            .success(function (data, status, headers, config) {
                                for (var key in scope.files) {
                                    if (file.name === scope.files[key].description) {
                                        scope.files[key].url = data.val.url
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
                scope.removeFile = function (index) {
                    scope.files.splice(index, 1)
                }
            }
        }
    })
