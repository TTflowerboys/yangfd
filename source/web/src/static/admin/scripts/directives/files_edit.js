/**
 * Created by Michael on 14/9/9.
 */
angular.module('app')
    .directive('filesEdit', function ($upload) {
        return {
            restrict: 'AE',
            templateUrl: '/static/admin/templates/files_edit.tpl.html',
            replace: true,
            scope: {
                files: '=ngModel',
                text:'@text'
            },
            link: function (scope, elm, attrs) {

                scope.onFileSelected = function ($files) {
                    var file = $files[0]
                    if (file) {
                        $upload.upload({
                            url: '/api/1/upload',
                            file: file,
                            fileFormDataName: 'data'
                        })
                            .success(function (data, status, headers, config) {
                                if (!scope.files) {
                                    scope.files = []
                                }
                                if(!scope.localFiles){
                                    scope.localFiles = []
                                }
                                scope.files.push(data.val.url)
                                scope.localFiles.push(file)
                            })
                    }
                }
                scope.removeFile = function (index) {
                    scope.files.splice(index, 1)
                }
            }
        }
    })
