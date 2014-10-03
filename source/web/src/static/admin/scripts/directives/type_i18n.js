/* Created by frank on 14-9-12. */
angular.module('app')
    .directive('typeI18n', function (i18nLanguages, $compile) {
        return {
            restrict: 'AE',
            scope: {
                model: '=typeI18n'
            },
            link: function (scope, element, attrs, ctrl) {
                if (!scope.model) {scope.model = {}}
                for (var i = 0, length = i18nLanguages.length; i < length; i += 1) {
                    scope.model[i18nLanguages[i].value] = scope.model[i18nLanguages[i].value] || ''
                }
            }
        }
    })


