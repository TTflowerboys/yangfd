angular.module('app')
    .directive('addDynamic', function ($http, $filter, growl, misc) {
        return {
            restrict: 'AE',
            scope: {
                item: '=ngModel',
                update: '&',
                user: '=',
                status: '='
            },
            templateUrl: '/static/admin/templates/add_dynamic.tpl.html',
            controller: function ($scope, $element, $rootScope, $compile) {
                $scope.submit = function (content) {
                    if(content === '') {
                        return
                    }
                    var dynamicData = {
                        id: misc.generateUUID(),
                        user: {
                            id: $scope.user.id,
                            nickname: $scope.user.nickname
                        },
                        content: content,
                        time: new Date().getTime(),
                        status: $scope.status
                    }
                    $scope.content = ''
                    var dynamic = _.clone(_.find($scope.item.custom_fields || [], {key: 'dynamic'}) || {key: 'dynamic', value: '[]'})
                    var dynamicTemp = _.clone(dynamic)
                    dynamic.value = JSON.stringify(JSON.parse(dynamic.value).concat([dynamicData]))
                    dynamicTemp.value = JSON.stringify(JSON.parse(dynamicTemp.value).concat([_.extend(_.clone(dynamicData), {sending: true})]))
                    function generateCustomFieldsByDynamic(dynamic){
                        return _.reject($scope.item.custom_fields || [], function (field) {
                            return field.key === 'dynamic'
                        }).concat([dynamic])
                    }
                    $scope.item.custom_fields = generateCustomFieldsByDynamic(dynamicTemp)
                    $scope.update({
                        data: {
                            id: $scope.item.id,
                            custom_fields: generateCustomFieldsByDynamic(dynamic)
                        }
                    })
                        .then(function (data) {
                            growl.addSuccessMessage(window.i18n('添加成功'), {enableHtml: true})
                            angular.extend($scope.item, data.data.val)
                        }, function () {
                            growl.addErrorMessage(window.i18n('添加失败'), {enableHtml: true})
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
