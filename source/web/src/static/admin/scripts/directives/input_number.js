/**
 * Created by Michael on 14/10/20.
 */
angular.module('app')
    .directive('inputNumber', function ($filter) {
        return {
            restrict: 'AE',
            template: '<input type="text" ng-model="tempValue" placeholder="{%placeholder%}" class="form-control ">',
            replace: true,
            scope: {
                value: '=value',
                placeholder: '@placeholder'
            },
            link: function (scope) {
                scope.tempValue = scope.value
                var oldValue
                scope.$watch('tempValue', function (newValue) {
                    if (_.isEmpty(newValue)) {
                        scope.value = undefined
                        return
                    }
                    if (oldValue === newValue || oldValue + '.' === newValue) {
                        return
                    }
                    var array = newValue.split('.')
                    var res
                    if (array) {
                        var n1 = array[0].replace(/[^0-9]/g, '')
                        res = $filter('number')(n1)
                        if (array.length > 1) {
                            if (array[1]) {
                                var n2 = array[1].replace(/[^0-9]/g, '')
                                var n2Length = n2.length
                                if (n2Length > 2) {
                                    n2Length = 2;
                                }
                                res = n1 + '.' + n2.substring(0,n2Length);
                                //res = $filter('number')(n3, n2Length)
                                scope.value = res.replace(/,/g, '')
                            } else {
                                res += '.'
                                scope.value = n1
                            }
                        } else {
                            scope.value = n1
                        }
                        oldValue = res
                        scope.tempValue = res
                    }
                })
                scope.$watch('value', function () {
                    scope.tempValue = scope.value
                })
            }
        }
    })

