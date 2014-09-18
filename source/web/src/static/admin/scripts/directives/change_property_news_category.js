/* Created by frank on 14-9-17. */
angular.module('app')
    .directive('changePropertyNewsCategory', function (propertyApi, userApi, $rootScope) {
        return {
            restrict: 'AE',
            templateUrl: '/static/admin/templates/change_property_news_category.tpl.html',
            scope: {
                item: '=ngModel',
                newsCategoryList: '=newsCategoryList',
                api: '=api',
                name: '@name'
            },
            link: function (scope, elm, attrs) {
                scope.userLanguage = $rootScope.userLanguage
                scope.$watch(function () {
                    return scope.newsCategoryList
                }, function (value) {
                    scope.newValue = _.filter(value, function (i) {
                        var result = _.find(scope.item.news_category, function (j) {
                            return j.id === i.id
                        })
                        return result
                    })
                })
                scope.onSubmit = function (item, newValue) {
                    var data = {id: item.id}
                    data[scope.name] = _.map(newValue, function (i) {
                        return i.id
                    })
                    scope.api.update(data, {
                        errorMessage: true
                    }).then(function () {
                        scope.open = false
                        scope.item[scope.name] = newValue
                    })
                }
            }
        }
    })
