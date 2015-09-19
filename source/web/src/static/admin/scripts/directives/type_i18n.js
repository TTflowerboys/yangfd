/* Created by frank on 14-9-12.
*  Init inputs for all i18n field
* */

angular.module('app')
    .directive('typeI18n', function (i18nLanguages) {
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
                        if(scope.model[i18nLanguages[i].value] === '') {
                            delete scope.model[i18nLanguages[i].value]
                        }
                    }
                }
                updateI18n()
                scope.$watch('model', function (newValue) {
                    if (newValue) {
                        return
                    }
                    if (!scope.model) {
                        scope.model = {}
                    }
                    updateI18n()
                })
            }
        }
    })


