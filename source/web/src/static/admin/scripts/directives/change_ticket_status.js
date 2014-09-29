/**
 * Created by Michael on 14/9/29.
 */
angular.module('app')
    .directive('changeTicketStatus', function ($filter, intentionStatusDictionary, supportStatusDictionary) {
        return {
            restrict: 'AE',
            templateUrl: '/static/admin/templates/change_ticket_status.tpl.html',
            replace: false,
            scope: {
                item: '=ngModel',
                type: '@type'
            },
            link: function (scope, elm, attrs) {
                var needInit = true
                scope.$watch('item', function (newValue) {
                    if (needInit) {
                        if (_.isEmpty(newValue)) {
                            return
                        }
                        if (scope.type === 'intention') {
                            scope.list = intentionStatusDictionary[scope.item]
                            if (_.isEmpty(scope.list)) {
                                scope.filter = $filter('intentionTicketStatusName')(scope.item)
                            }
                        }
                        if (scope.type === 'support') {
                            scope.list = supportStatusDictionary[scope.item]
                            if (_.isEmpty(scope.list)) {
                                scope.filter = $filter('supportTicketStatusName')(scope.item)
                            }
                        }
                        needInit = false
                    }
                })

            }
        }
    })