/* Created by frank on 14-9-15. */
angular.module('app')
    .directive('editPropertyStatus', function (propertyApi, propertyStatus, userApi) {
        return {
            restrict: 'AE',
            templateUrl: '/static/admin/templates/edit_property_status.tpl.html',
            replace: false,
            scope: {
                item: '=ngModel'
            },
            link: function (scope, elm, attrs) {
                var user = userApi.getCurrentUser()
                if (!user) {
                    return
                }
                var roles = user.role
                if (_.contains(roles, 'admin') || _.contains(roles, 'jr_admin') || _.contains(roles, 'operation')) {
                    scope.propertyStatus = propertyStatus
                } else if (_.contains(roles, 'jr_operation')) {
                    scope.propertyStatus = propertyStatus.filter(function (one, index, array) {
                        return _.contains(['draft', 'not translated', 'translating', 'not reviewed'], one.value)||one.value === scope.item.status
                    })
                } else {
                    scope.propertyStatus = propertyStatus.filter(function (one, index, array) {
                        return one.value === scope.item.status
                    })
                }
                scope.onUpdateStatus = function (item, newStatus) {
                    propertyApi.update({id: item.id, status: newStatus}, {successMessage: '操作成功', errorMessage: true})
                        .success(function () {
                            item.status = newStatus
                        })
                }
            }
        }
    })
