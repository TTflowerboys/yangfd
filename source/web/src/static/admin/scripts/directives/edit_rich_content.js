/**
 * Created by zhou on 15-1-15.
 */
angular.module('app')
    .directive('editRichContent', function ($rootScope) {
        return {
            restrict: 'AE',
            templateUrl: '/static/admin/templates/edit_rich_content.tpl.html',
            replace: true,
            scope: {
                item: '=ngModel'
            },
            link: function (scope) {
                scope.userLanguage = $rootScope.userLanguage
            }
        }
    })