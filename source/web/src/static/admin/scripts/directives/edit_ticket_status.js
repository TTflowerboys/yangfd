/**
 * Created by Michael on 14/9/29.
 */
angular.module('app')
    .directive('editTicketStatus', function ($filter, intentionStatusDictionary, supportStatusDictionary) {
        return {
            restrict: 'AE',
            templateUrl: '/static/admin/templates/change_ticket_status.tpl.html',
            scope: {
                item: '=ngModel',
                type: '@type'
            },
            link: function (scope) {
                var needInit = true
                scope.$watch('item.status', function (newValue) {
                    if (needInit) {
                        if (_.isEmpty(newValue)) {
                            return
                        }
                        if (scope.type === 'intention') {
                            scope.list = intentionStatusDictionary[newValue]
                            if (_.isEmpty(scope.list)) {
                                scope.filter = $filter('intentionTicketStatusName')(newValue)
                            }
                        }
                        if (scope.type === 'support') {
                            scope.list = supportStatusDictionary[newValue]
                            if (_.isEmpty(scope.list)) {
                                scope.filter = $filter('supportTicketStatusName')(newValue)
                            }
                        }
                        needInit = false
                    }
                })
            }
        }
    })
