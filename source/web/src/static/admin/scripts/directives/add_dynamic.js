angular.module('app')
    .directive('addDynamic', function ($http, $filter, growl, misc) {
        return {
            restrict: 'AE',
            scope: {
                item: '=ngModel',
                addDynamic: '&',
                sendToLandlord: '&',
                sendToTenant: '&',
                disableSms: '=' //如果租客或者房东的手机号是英国的，才能使用短信沟通，否则需要disable掉短信相关的按钮
            },
            templateUrl: '/static/admin/templates/add_dynamic.tpl.html',
            controller: function ($scope, $element, $rootScope, $compile) {
                $scope.submit = function (content) {
                    if(content === '') {
                        return
                    }
                    $scope.content = ''
                    $scope.addDynamic({
                        data: {
                            content: content,
                            type: 'dynamic',
                        }
                    })
                }

                $scope.submitLandlord = function (content) { //发送短信给房东
                    if(content === '') {
                        return
                    }
                    $scope.content = ''
                    $scope.sendToLandlord({
                        content: content
                    })
                }

                $scope.submitTenant = function (content) { //发送短信给租客
                    if(content === '') {
                        return
                    }
                    $scope.content = ''
                    $scope.sendToTenant({
                        content: content
                    })
                }

                $scope.onKeyPress = function (keyEvent) {
                    // Submit content when enter pressed
                    if(keyEvent.which === 13){
                        $scope.submit($scope.content)
                    }
                }
            },
            link: function (scope) {

            }
        }
    })
