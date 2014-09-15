/* Created by frank on 14-9-15. */
angular.module('app')
    .directive('changeEstateStatus', function (estateApi, estateStatus) {
        return {
            restrict: 'AE',
            templateUrl: '/static/admin/templates/change_estate_status.tpl.html',
            replace: false,
            scope: {
                item: '=ngModel'
            },
            link: function ($scope, elm, attrs) {
                $scope.estateStatus = estateStatus
                $scope.onUpdateStatus = function (item, newStatus) {
                    estateApi.update({id: item.id, status: newStatus}, {successMessage: '增加权限操作成功', errorMessage: true})
                        .success(function () {
                            item.status = newStatus
                        })
                }
            }
        }
    })
