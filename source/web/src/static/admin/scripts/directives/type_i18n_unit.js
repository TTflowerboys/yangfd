/* Created by frank on 14-9-15. */
angular.module('app')
    .directive('typeI18nUnit', function ($parse, $rootScope) {
        return {
            restrict: 'AE',
            templateUrl: '/static/admin/templates/type_i18n_unit.tpl.html',
            replace: true,
            scope: {
                i18nUnit: '=ngModel',
                placeholder: '@placeholder',
                data: '=data',
                unit: '=unit'
            },
            link: function (scope, elm, attrs, ctrl) {
                if (!scope.i18nUnit) {
                    scope.i18nUnit = {}
                }
                scope.i18nUnit.value = scope.i18nUnit.value || ''
                scope.isDefaultValue = true
                scope.$watch('unit', function (value) {
                    if (_.isEmpty(value)) {
                        return
                    }
                    if (scope.isDefaultValue === true) {
                        scope.i18nUnit.unit = value
                    }
                })
            }
        }
    })

