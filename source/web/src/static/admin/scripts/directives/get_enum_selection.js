/**
 * Created by Michael on 14/9/24.
 */
angular.module('app')
    .directive('getEnumSelection', function ($rootScope, enumApi) {
        return {
            restrict: 'AE',
            templateUrl: '/static/admin/templates/get_enum_selection.tpl.html',
            scope: {
                enumId: '=ngModel',
                enumType: '@enumType',
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