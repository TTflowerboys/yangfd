/* Created by frank on 14-9-17. */

angular.module('app')
    .directive('getNewsCategoryList', function (enumApi) {
        return {
            link: function (scope, element, attrs) {
                enumApi.getOriginEnumsByType('news_category', {params: {_i18n: 'disabled'}}).success(function (data) {
                    scope.newsCategoryList = data.val
                })
            }
        }
    })
