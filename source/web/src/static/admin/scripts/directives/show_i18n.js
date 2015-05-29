/**
 * Created by zhou on 15-2-11.
 */
angular.module('app')
    .directive('showI18n', function (i18nLanguages, $rootScope) {
        return {
            restrict: 'AE',
            template: '<div><span ng-if="preferred">{%model[userLanguage]%}</span>' +
            '<span ng-if="!preferred" style="color:#0099FF">{%model[otherValue]%}</span></div>',
            replace: true,
            scope: {
                model: '=showI18n'
            },
            link: function (scope, elem) {
                if (scope.model) {
                    scope.userLanguage = $rootScope.userLanguage.value
                    for (var i = 0, length = i18nLanguages.length; i < length; i += 1) {
                        scope.model[i18nLanguages[i].value] = scope.model[i18nLanguages[i].value] || ''
                        if (i18nLanguages[i].value !== $rootScope.userLanguage.value) {
                            scope.otherValue = i18nLanguages[i].value
                        }
                    }
                    scope.preferred = scope.model[$rootScope.userLanguage.value] ? true : false
                }

                $rootScope.$watch('userLanguage.value', function (newValue) {
                    if (scope.model) {
                        scope.userLanguage = newValue
                        for (var i = 0, length = i18nLanguages.length; i < length; i += 1) {
                            scope.model[i18nLanguages[i].value] = scope.model[i18nLanguages[i].value] || ''
                            if (i18nLanguages[i].value !== newValue) {
                                scope.otherValue = i18nLanguages[i].value
                            }
                        }
                        scope.preferred = scope.model[newValue] ? true : false
                    }

                })
            }
        }
    })
