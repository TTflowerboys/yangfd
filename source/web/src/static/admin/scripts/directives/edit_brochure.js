/**
 * Created by zhou on 14-11-21.
 */
angular.module('app')
    .directive('editBrochure', function ($upload) {
        return {
            restrict: 'AE',
            templateUrl: '/static/admin/templates/edit_brochure.tpl.html',
            replace: true,
            scope: {
                brochure: '=ngModel',
                text: '@text'
            },
            link: function (scope, elm, attrs) {

                scope.onFileSelected = function ($files) {
                    var file = $files[0]
                    if (file) {
                        if (!scope.brochure) {
                            scope.brochure = {}
                        }
                        scope.brochure = {url: file.name}
                        $upload.upload({
                            url: '/api/1/upload_file',
                            file: file,
                            fileFormDataName: 'data',
                            ignoreLoadingBar: true
                        })
                            .success(function (data, status, headers, config) {
                                scope.brochure.url = data.val.url
                            })
                    }
                }
                scope.removeBrochure = function (index) {
                    scope.brochure = undefined
                }
            }
        }
    })