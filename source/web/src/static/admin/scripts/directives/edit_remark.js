angular.module('app')
    .directive('editRemark', function ($rootScope, growl) {
        return {
            restrict: 'AE',
            templateUrl: '/static/admin/templates/edit_remark.tpl.html',
            scope: {
                customFields: '=ngModel',
                itemId: '=itemId',
                placement: '=placement',
                update: '&',
            },
            controller: function ($scope, $element, $rootScope, $compile) {

                $scope.tooltip = function () {
                    setTimeout(function () {
                        $element.find('[data-toggle="tooltip"]').tooltip('destroy').tooltip({
                            title: $element.find('[data-toggle="tooltip"]').attr('data-title')
                        })
                    }, 200)
                }
                $scope.initEditCustomFields = function () {
                    setTimeout(function () {
                        $element.find('[data-toggle="tooltip"]').popover('destroy').popover({
                            title: $rootScope.i18n('编辑备注'),
                            content: $compile(
                                $element.find('[data-content]').html()
                            )($scope),
                            html: true,
                            trigger: 'click',
                        })
                    }, 200)
                }

                $scope.showEditCustomFields = function () {
                    $element.find('[data-toggle="tooltip"]').popover('toggle')
                }
                /*$scope.item = {
                    id: itemId,
                    customFields: customFields
                }*/
            },
            link: function (scope, elem) {
                scope.tooltip()
                scope.initEditCustomFields()
                scope.remark = ''
                function updateRemark(){
                    if(_.isArray(scope.customFields)) {
                        scope.remark =(_.find(scope.customFields, function(field){return field.key === 'remark'}) || {}).value
                    }
                }
                updateRemark()
                scope.$watch('customFields', function () {
                    updateRemark()
                })
                elem.delegate('.changeCustomFields', 'click', function () {
                    var customFields = _.reject(scope.customFields || [], function (field) {
                        return field.key === 'remark'
                    })
                    customFields.push({
                        key: 'remark',
                        value: scope.remark
                    })
                    scope.update({
                        data: {
                            id: scope.itemId,
                            custom_fields: customFields
                        }
                    })
                        .success(function (data) {
                            growl.addSuccessMessage(window.i18n('备注更改成功'), {enableHtml: true})
                            scope.customFields = data.val.custom_fields
                            scope.tooltip()
                            scope.initEditCustomFields()
                            elem.find('.remarkBtn').popover('hide')
                        })
                })
                elem.delegate('.hiddenPopover', 'click', function () {
                    elem.find('.remarkBtn').popover('hide')
                })
            }
        }
    })
