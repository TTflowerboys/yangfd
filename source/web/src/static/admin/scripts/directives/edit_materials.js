/**
 * Created by zhou on 15-1-14.
 */
angular.module('app')
    .directive('editMaterials', function ($upload, $rootScope, growl) {
        return {
            restrict: 'AE',
            templateUrl: '/static/admin/templates/edit_materials.tpl.html',
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
                        scope.files.push({link: '', filename: file.name})
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
                                    if (file.name === scope.files[key].filename) {
                                        scope.files[key].link = data.val.url
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
