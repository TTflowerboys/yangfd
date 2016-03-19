angular.module('app')
    .directive('editRentIntentionTicketStatus',
    function (rentRequestIntentionApi, rentIntentionTicketStatus) {
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
                    rentRequestIntentionApi.update(params,
                        {successMessage: '操作成功', errorMessage: true})
                        .success(function () {
                            item.status = newStatus
                            item.canceled_reason = scope.canceledReason
                        })
                }
            }
        }
    })
