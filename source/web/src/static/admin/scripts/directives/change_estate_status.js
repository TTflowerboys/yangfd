/* Created by frank on 14-9-15. */
angular.module('app')
    .directive('changeEstateStatus', function (adminApi) {
        return {
            restrict: 'AE',
            templateUrl: '/static/admin/templates/add_role.tpl.html',
            replace: false,
            scope: {
                item: '=ngModel'
            },
            link: function ($scope, elm, attrs) {
                $scope.onAddRole = function (item, roleToAdd) {
                    adminApi.addRole(item.id, roleToAdd, {successMessage: '增加权限操作成功', errorMessage: true})
                        .success(function () {
                            item.role.push(roleToAdd)
                            $scope.roleToAdd = ''
                        })
                }
            }
        }
    })
