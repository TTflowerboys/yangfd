/**
 * Created by Michael on 14/10/1.
 */
angular.module('app')
    .directive('showSupportTicketHistory', function ($rootScope, supportApi) {
        return {
            restrict: 'AE',
            templateUrl: '/static/admin/templates/show_support_ticket_history.tpl.html',
            replace: false,
            scope: {
                id: '=id'
            },
            link: function (scope, attrs) {
                scope.userLanguage = $rootScope.userLanguage

                supportApi.getHistory(scope.id,
                    {params: {_i18n: 'disabled'}, errorMessage: true}).success(function (data) {
                        scope.history = data.val
                    })
            }
        }
    })
