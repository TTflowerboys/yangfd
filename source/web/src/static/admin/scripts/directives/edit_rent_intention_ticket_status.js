angular.module('app')
    .directive('editRentIntentionTicketStatus',
    function (rentRequestIntentionApi, rentIntentionTicketStatus, couponApi) {
        return {
            restrict: 'AE',
            templateUrl: '/static/admin/templates/edit_rent_intention_ticket_status.tpl.html',
            replace: false,
            scope: {
                item: '=ngModel',
                newStatus: '='
            },
            link: function (scope, elm, attrs) {
                var need_init = true
                scope.canceledReason = scope.item.canceled_reason
                scope.$watch('item.canceled_reason', function (newValue) {
                    scope.canceledReason = newValue
                })
                scope.$watch('item.status', function (newValue) {
                    if (need_init && newValue) {
                        need_init = false
                        scope.list = rentIntentionTicketStatus
                        scope.newStatus = newValue
                    }
                })
                scope.onUpdateStatus = function (item, newStatus) {
                    var params = {id: item.id, status: newStatus}
                    if(newStatus === 'canceled') {
                        params.reason = scope.canceledReason
                    }
                    if(newStatus === 'checked_in' && scope.item.offer && item.offer.status === 'new' && scope.useCoupon) {
                        couponApi.update({
                            id: scope.item.offer.id,
                            status: 'used'
                        }, {
                            successMessage: '优惠券使用成功',
                            errorMessage: true
                        }).success(function () {
                            item.offer.status = 'used'

                        })
                    }
                    rentRequestIntentionApi.update(params, {
                        successMessage: '操作成功',
                        errorMessage: true
                    }).success(function () {
                        item.status = newStatus
                        item.updated_comment = scope.canceledReason
                    })
                }
            }
        }
    })
