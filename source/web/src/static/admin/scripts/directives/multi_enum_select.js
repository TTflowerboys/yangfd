/**
 * Created by Michael on 14/10/3.
 */
angular.module('app')
    .directive('multiEnumSelect', function ($parse, enumApi, $rootScope) {
        return {
            restrict: 'AE',
            templateUrl: '/static/admin/templates/multi_enum_select.tpl.html',
            scope: {
                item: '=ngModel',
                type: '@name'
            },
            link: function (scope, elm, attrs) {
                var needInit = true
                scope.userLanguage = $rootScope.userLanguage
                enumApi.getEnumsByType(scope.type)
                    .success(function (data) {
                        scope.source = data.val
                        angular.forEach(scope.source, function (value, key) {
                            value.label = value.value[scope.userLanguage.value] || ''
                            if (scope.item) {
                                angular.forEach(scope.item, function (id, key) {
                                    if (value.id === id) {
                                        value.ticked = true
                                    }
                                })
                            }
                        })
                    }
                )
                scope.$watch('item', function (newValue) {
                    if (newValue) {
                        if (needInit) {
                            angular.forEach(scope.source, function (value, key) {
                                value.label = value.value[scope.userLanguage.value] || ''
                                if (scope.item) {
                                    angular.forEach(scope.item, function (id, key) {
                                        if (value.id === id) {
                                            value.ticked = true
                                        }
                                    })
                                }
                            })
                            needInit = false
                        }
                    }
                })
                scope.$watch('userLanguage.value', function (newValue) {

                    angular.forEach(scope.source, function (value, key) {
                        value.label = value.value[newValue] || ''
                    })
                })
                scope.onCloseData = function () {
                    scope.item = []
                    angular.forEach(scope.source, function (value, key) {
                        if (value.ticked) {
                            scope.item.push(value.id)
                        }
                    })
                }
            }
        }
    })