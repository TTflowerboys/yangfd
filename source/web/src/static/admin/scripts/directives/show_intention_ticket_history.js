/**
 * Created by Michael on 14/10/1.
 */
angular.module('app')
    .directive('showIntentionTicketHistory', function ($rootScope, intentionApi) {
        return {
            restrict: 'AE',
            templateUrl: '/static/admin/templates/intention_ticket_history.tpl.html',
            replace: false,
            scope: {
                id: '=id'
            },
            link: function (scope, attrs) {
                scope.userLanguage = $rootScope.userLanguage

                intentionApi.history(scope.id, {params: {_i18n: 'disabled'}}).success(function (data) {
                    scope.history = data.val
                })
            }
        }
    })
