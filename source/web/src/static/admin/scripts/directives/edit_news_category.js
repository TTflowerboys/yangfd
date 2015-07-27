/* Created by frank on 14-9-17. */
angular.module('app')
    .directive('editNewsCategory', function (propertyApi, userApi, $rootScope, misc) {
        return {
            restrict: 'AE',
            templateUrl: '/static/admin/templates/edit_news_category.tpl.html',
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
                    scope.newValue = misc.getIntersectionById(value, scope.item[scope.name])
                })
                scope.clearNewsCategory = function (item) {
                    var data = {id: item.id}
                    data.unset_fields = ([scope.name])
                    scope.api.update(item.id, data, {
                        errorMessage: true
                    }).then(function () {
                        scope.open = false
                        delete scope.item[scope.name]
                    })
                }
                scope.onSubmit = function (item, newValue) {
                    var data = {id: item.id}
                    data[scope.name] = _.map(newValue, function (i) {
                        return i.id
                    })
                    scope.api.update(item.id, data, {
                        errorMessage: true
                    }).then(function () {
                        scope.open = false
                        scope.item[scope.name] = newValue
                    })
                }
            }
        }
    })
