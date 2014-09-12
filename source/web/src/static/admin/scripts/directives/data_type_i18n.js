/* Created by frank on 14-9-12. */
angular.module('app')
    .directive('typeI18n', function ($parse, i18n_languages, $rootScope) {
        return {
            restrict: 'AE',
            scope: {
                model: '=typeI18n'
            },
            link: function (scope, elm, attrs, ctrl) {
                if (!scope.model) {scope.model = {}}
                for (var i = 0, length = i18n_languages.length; i < length; i += 1) {
                    scope.model[i18n_languages[i].value] = scope.model[i18n_languages[i].value] || ''
                }
            }
        }
    })


