/**
 * Created by Michael on 14/9/24.
 */
angular.module('app')
    .directive('selectEnum', function ($rootScope, enumApi) {
        return {
            restrict: 'AE',
            templateUrl: '/static/admin/templates/enum_select.tpl.html',
            replace: true,
            scope: {
                enumId: '=ngModel',
                enumType: '@name',
                enumOption: '@text'
            },
            link: function (scope) {
                scope.userLanguage = $rootScope.userLanguage
                enumApi.getEnumsByType(scope.enumType)
                    .success(function (data) {
                        scope.enumList = data.val
                    })
            }
        }
    })
