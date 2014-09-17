/* Created by frank on 14-9-15. */
angular.module('app')
    .directive('typeI18nUnit', function ($parse, i18nLanguages, $rootScope) {
        return {
            restrict: 'AE',
            templateUrl: '/static/admin/templates/type_i18n_unit.tpl.html',
            replace: true,
            scope: {
                i18nUnit: '=ngModel',
                unit: '=unit',
                placeholder: '@placeholder'
            },
            link: function (scope, elm, attrs, ctrl) {
                if (!scope.i18nUnit) {scope.i18nUnit = {}}
                for (var i = 0, length = i18nLanguages.length; i < length; i += 1) {
                    scope.i18nUnit.value = scope.i18nUnit.value || ''
                }
                scope.$watch('unit',function(value){
                    scope.i18nUnit.unit = value
                })
            }
        }
    })

