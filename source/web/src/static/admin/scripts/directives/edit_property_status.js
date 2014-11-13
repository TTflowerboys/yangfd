/* Created by frank on 14-9-15. */
angular.module('app')
    .directive('editPropertyStatus',
    function (propertyApi, propertyStatus, userApi, propertySellingStatus, propertyReviewStatus) {
        return {
            restrict: 'AE',
            templateUrl: '/static/admin/templates/edit_property_status.tpl.html',
            replace: false,
            scope: {
                item: '=ngModel'
            },
            link: function (scope, elm, attrs) {
                var need_init = true
                var user = userApi.getCurrentUser()
                if (!user) {
                    return
                }
                var roles = user.role
                scope.$watch('item.status', function (newValue) {
                    if (need_init && newValue) {
                        need_init = false
                        if (_.contains(roles, 'admin') || _.contains(roles, 'jr_admin') || _.contains(roles,
                                'operation')) {
                            if (newValue === 'not reviewed') {
                                scope.propertyStatus = propertyReviewStatus
                            } else if (newValue === 'selling' || newValue === 'hidden' || newValue === 'sold out') {
                                scope.propertyStatus = propertySellingStatus
                            } else {
                                scope.propertyStatus = propertyStatus.filter(function (one, index, array) {
                                    return _.contains(['draft', 'not translated', 'translating', 'not reviewed'],
                                            one.value) || one.value === scope.item.status
                                })
                            }
                            return
                        }
                        if (_.contains(roles, 'jr_operation')) {
                            if (newValue === 'draft' || newValue === 'not translated' ||
                                newValue === 'translating' || newValue === 'not reviewed' || newValue === 'rejected') {
                                scope.propertyStatus = propertyStatus.filter(function (one, index, array) {
                                    return _.contains(['draft', 'not translated', 'translating', 'not reviewed'],
                                            one.value) || one.value === scope.item.status
                                })
                                return
                            }
                        }
                        scope.propertyStatus = propertyStatus.filter(function (one, index, array) {
                            return one.value === scope.item.status
                        })
                    }
                })
                scope.onUpdateStatus = function (item, newStatus) {
                    propertyApi.update({id: item.id, status: newStatus},
                        {successMessage: '操作成功', errorMessage: true})
                        .success(function () {
                            item.status = newStatus
                        })
                }
            }
        }
    })
