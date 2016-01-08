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
                scope.$watch('item.status', function (newValue) {
                    if (need_init && newValue) {
                        need_init = false
                        scope.list = rentIntentionTicketStatus
                        scope.newStatus = newValue
                    }
                })
                scope.onUpdateStatus = function (item, newStatus) {
                    rentRequestIntentionApi.update({id: item.id, status: newStatus},
                        {successMessage: '操作成功', errorMessage: true})
                        .success(function () {
                            item.status = newStatus
                        })
                }
            }
        }
    })
