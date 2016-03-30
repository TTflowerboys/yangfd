angular.module('app')
    .directive('editableProperty', function ($rootScope, growl) {
        return {
            restrict: 'AE',
            templateUrl: '/static/admin/templates/editable_property.tpl.html',
            scope: {
                model: '@property',
                itemId: '=itemId',
                key: '@editableProperty',
                update: '&',
            },
            controller: function ($scope, $element, $rootScope, $compile) {
                $scope.isEditing = false
                $scope.editProperty = function () {
                    $scope.model_tmp = $scope.model
                    $scope.isEditing = true
                }
                $scope.updateProperty = function () {
                    if($scope.model_tmp === $scope.model) {
                        growl.addErrorMessage($rootScope.i18n('内容没有改变'), {enableHtml: true})
                        return $scope.cancelUpdateProperty()
                    }
                    var data = {
                        id: $scope.itemId,
                    }
                    data[$scope.key] = $scope.model_tmp
                    $scope.update({
                        data: data,
                        config: {
                            successMessage: 'Update successfully',
                            errorMessage: 'Update failed'
                        }
                    })
                        .then(function (data) {
                            $scope.isEditing = false
                            $scope.model = $scope.model_tmp
                        })
                }
                $scope.cancelUpdateProperty = function () {
                    $scope.isEditing = false
                }
            },
        }
    })
