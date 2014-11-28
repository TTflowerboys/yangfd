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

                var isInit = true

                scope.$watch('brochure', function (newValue) {
                    // Update brochure status when init directive
                    if (isInit && scope.brochure && scope.brochure.length > 0) {
                        scope.brochureStatus = 'done'
                        //TODO:set up preview url
                    }
                })

                scope.onFileSelected = function ($files) {
                    isInit = false
                    var file = $files[0]
                    if (file) {
                        //Reset brochure
                        scope.brochure = {}

                        scope.brochureStatus = 'uploading'
                        $upload.upload({
                            url: '/api/1/upload_file',
                            file: file,
                            fileFormDataName: 'data',
                            ignoreLoadingBar: true
                        }).success(function (data, status, headers, config) {
                            scope.brochure.url = data.val.url
                            scope.brochureStatus = 'uploaded'
                        })
                    }
                }

                scope.removeBrochure = function (index) {
                    scope.brochure = undefined
                }
            }
        }
    })