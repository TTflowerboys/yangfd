/**
 * Created by zhou on 15-2-11.
 */
angular.module('app')
    .directive('inputI18n', function (i18nLanguages, $rootScope) {
        return {
            restrict: 'AE',
            template: '<input type="text" ng-model="model[userLanguage.value]" placeholder="{%model[otherValue]%}" class="form-control ">',
            replace: true,
            scope: {
                model: '=inputI18n'
            },
            link: function (scope) {
                if (!scope.model) {
                    scope.model = {}
                }
                scope.userLanguage = $rootScope.userLanguage
                for (var i = 0, length = i18nLanguages.length; i < length; i += 1) {
                    scope.model[i18nLanguages[i].value] = scope.model[i18nLanguages[i].value] || ''
                    if (i18nLanguages[i].value !== $rootScope.userLanguage.value) {
                        scope.otherValue = i18nLanguages[i].value
                    }
                }
                $rootScope.$watch('userLanguage.value',function(){
                    if (!scope.model) {
                        scope.model = {}
                    }
                    for (var i = 0, length = i18nLanguages.length; i < length; i += 1) {
                        scope.model[i18nLanguages[i].value] = scope.model[i18nLanguages[i].value] || ''
                        if (i18nLanguages[i].value !== $rootScope.userLanguage.value) {
                            scope.otherValue = i18nLanguages[i].value
                        }
                    }
                })
            }
        }
    })

