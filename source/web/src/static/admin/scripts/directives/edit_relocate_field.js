angular.module('app')
    .directive('editRelocateField', function ($rootScope, growl) {
        return {
            restrict: 'AE',
            templateUrl: '/static/admin/templates/edit_relocate_field.tpl.html',
            scope: {
                customFields: '=ngModel',
                itemId: '=itemId',
                update: '&',
            },
            link: function (scope, elem) {
                function updateRelocate(){
                    if(_.isArray(scope.customFields)) {
                        scope.relocate =(_.find(scope.customFields, function(field){return field.key === 'relocate'}) || {}).value
                    }
                }
                updateRelocate()
                scope.$watch('customFields', function () {
                    updateRelocate()
                })

                scope.onSubmit = function (newValue) {
                    var customFields = _.reject(scope.customFields || [], function (field) {
                        return field.key === 'relocate'
                    })

                    if(!newValue && scope.relocate) {
                        newValue = scope.relocate
                    }

                    // Only submit when has new value
                    if(newValue){

                        // Do not submit same content
                        if(scope.relocate && newValue.toString() === scope.relocate.toString()){
                            return
                        }

                        customFields.push({
                            key: 'relocate',
                            value: newValue
                        })
                        scope.update({
                            data: {
                                id: scope.itemId,
                                custom_fields: customFields
                            }
                        })
                            .success(function (data) {
                                growl.addSuccessMessage(window.i18n('relocate更改成功'), {enableHtml: true})
                                scope.customFields = data.val.custom_fields
                                scope.open = false
                            })
                    }
                }
            }
        }
    })
