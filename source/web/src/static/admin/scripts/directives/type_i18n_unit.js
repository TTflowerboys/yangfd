/* Created by frank on 14-9-15. */
angular.module('app')
    .directive('typeI18nUnit', function ($parse, i18nLanguages, $rootScope) {
        return {
            restrict: 'AE',
            scope: {
                model: '=typeI18nUnit'
            },
            link: function (scope, elm, attrs, ctrl) {
                if (!scope.model) {scope.model = {}}
                for (var i = 0, length = i18nLanguages.length; i < length; i += 1) {
                    scope.model.unit = scope.model.unit || ''
                    scope.model.value = scope.model.value || ''
                }
            }
        }
    })

