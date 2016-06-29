/**
 * Created by zhou on 14-11-21.
 */
angular.module('app')
    .directive('editBrochure', function ($upload, $rootScope, growl) {
        return {
            restrict: 'AE',
            templateUrl: '/static/admin/templates/edit_brochure.tpl.html',
            replace: true,
            scope: {
                brochure: '=ngModel',
                text: '@text',
                property_id: '=propertyId'
            },
            link: function (scope, elm, attrs) {

                var isInit = true

                scope.$watch('brochure', function (newValue) {
                    // Update brochure status when init directive
                    if (isInit && scope.brochure && scope.brochure.length > 0) {
                        if (scope.brochure[0].rendering) {
                            scope.brochureStatus = 'rendering'
                        } else if (scope.brochure[0].rendered && scope.brochure[0].rendered.length > 0) {
                            scope.brochureStatus = 'done'

                            scope.url = '/pdf_viewer/property/' + scope.property_id
                        } else {
                            scope.brochureStatus = 'unknown'
                        }

                    }
                })

                scope.onFileSelected = function ($files) {
                    isInit = false
                    var file = $files[0]
                    if (file) {
                        //Reset brochure
                        scope.brochure = {}
                        var url = '/api/1/upload_file'
                        scope.brochureStatus = 'uploading'
                        $upload.upload({
                            url: url,
                            file: file,
                            fileFormDataName: 'data',
                            ignoreLoadingBar: true,
                            errorMessage: true
                        }).success(function (data, status, headers, config) {
                            scope.brochure.url = data.val.url
                            scope.brochureStatus = 'uploaded'
                        }).error(function (data) {
                            if (!data) {
                                growl.addErrorMessage($rootScope.renderHtml('No Response'), {enableHtml: true})
                            }
                            scope.brochureStatus = 'error'
                        })
                    }
                }

                scope.removeBrochure = function (index) {
                    scope.brochure = undefined
                }
            }
        }
    })