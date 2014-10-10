/**
 * Created by Michael on 14/9/26.
 */
angular.module('app')
    .directive('selectBudget', function ($rootScope, enumApi, i18nCurrency) {
        return {
            restrict: 'AE',
            templateUrl: '/static/admin/templates/budget_select.tpl.html',
            scope: {
                enumId: '=ngModel',
                enumOption: '@text'
            },
            link: function (scope) {
                scope.userLanguage = $rootScope.userLanguage
                scope.i18nCurrency = $rootScope.i18nCurrency
                enumApi.getEnumsByType('budget')
                    .success(function (data) {
                        scope.budgetList = data.val
                        if (scope.enumId) {
                            for (var b in scope.budgetList) {
                                if (scope.budgetList[b].id === scope.enumId) {
                                    scope.currency = scope.budgetList[b].currency
                                }
                            }
                        }
                    })

                scope.$watch('currency', function (newValue) {
                    if (!scope.enumList) {
                        scope.enumList = []
                    } else {
                        var length = scope.enumList.length
                        scope.enumList.splice(0, length)
                    }
                    for (var b in scope.budgetList) {
                        if (scope.budgetList[b].currency === newValue) {
                            scope.enumList.push(scope.budgetList[b])
                        }
                    }
                })
                var needInit = true
                scope.$watch('enumId', function (newValue) {
                        if (needInit) {
                            if (_.isEmpty(newValue)) {
                                return
                            }
                            if (scope.budgetList) {
                                for (var b in scope.budgetList) {
                                    if (scope.budgetList[b].id === scope.enumId) {
                                        scope.currency = scope.budgetList[b].currency
                                    }
                                }
                                needInit = false
                            }
                        }
                    }
                )
            }
        }
    })
