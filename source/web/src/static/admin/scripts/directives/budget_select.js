/**
 * Created by Michael on 14/9/26.
 */
angular.module('app')
    .directive('budgetSelect', function ($rootScope, enumApi, i18nCurrency) {
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
                        console.log(scope.budgetList)

                    })

                scope.$watch('currency', function (newValue) {
                    if(!scope.enumList){
                        scope.enumList = []
                    }else{
                        var length = scope.enumList.length
                        scope.enumList.splice(0, length)
                    }
                    for (var b in scope.budgetList) {
                        console.log("scope.budgetList[b]")
                        console.log(scope.budgetList[b])
                        if (scope.budgetList[b].currency === newValue) {
                            scope.enumList.push(scope.budgetList[b])
                        }
                    }
                })
            }
        }
    })