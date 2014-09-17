/* Created by frank on 14-9-17. */
angular.module('app')
    .directive('changePropertyNewsCategory', function (propertyApi, userApi) {
        return {
            restrict: 'AE',
            templateUrl: '/static/admin/templates/change_property_news_category.tpl.html',
            scope: {
                item: '=ngModel',
                newsCategoryList: '=newsCategoryList'
            },
            link: function (scope, elm, attrs) {
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
                    propertyApi.update({id: item.id, news_category: _.map(newValue, function (i) {
                        return i.id
                    })})
                }
            }
        }
    })
