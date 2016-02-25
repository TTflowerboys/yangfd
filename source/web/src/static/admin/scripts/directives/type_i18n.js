/* Created by frank on 14-9-12.
*  Init inputs for all i18n field
* */

angular.module('app')
    .directive('typeI18n', function (i18nLanguages, $rootScope) {
        return {
            restrict: 'AE',
            scope: {
                model: '=typeI18n'
            },
            link: function (scope, element, attrs, ctrl) {
                if (!scope.model) {
                    scope.model = {}
                }
                function updateI18n () {
                    for (var i = 0, length = i18nLanguages.length; i < length; i += 1) {
                        if(i18nLanguages[i].value !== $rootScope.userLanguage.value && scope.model[i18nLanguages[i].value] === '') {
                            delete scope.model[i18nLanguages[i].value]
                        }
                        if(i18nLanguages[i].value === $rootScope.userLanguage.value && scope.model[i18nLanguages[i].value] === undefined) {
                            scope.model[i18nLanguages[i].value] = ''
                        }
                    }
                }
                updateI18n()
                scope.$watch('model', function (newValue) {
                    if (!scope.model) {
                        scope.model = {}
                    }
                    updateI18n()
                }, true)
            }
        }
    })


