/* Created by frank on 14-8-28. */
angular.module('app')
    .directive('removeRole', function (adminApi) {
        return {
            restrict: 'AE',
            templateUrl: '/static/admin/templates/remove_role.tpl.html',
            replace: false,
            scope: {
                item: '=ngModel'
            },
            link: function (scope, elm, attrs) {
                scope.onRemoveRole = function (item, roleToRemove) {
                    adminApi.removeRole(item.id, roleToRemove, {successMessage: 'done', errorMessage: true})
                        .success(function () {
                            item.role.splice(item.role.indexOf(roleToRemove), 1)
                            scope.roleToRemove = ''
                        })
                }
            }
        }
    })
