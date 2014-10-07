/* Created by chaowang on 14-9-23. */
angular.module('app')
    .directive('searchQuery', function () {
        return {
            restrict: 'AE',
            templateUrl: '/static/admin/templates/search_user_query.tpl.html',
            link: function ($scope, elm, attrs) {
                $scope.onSearch = function (searchText) {
                    var param = {}
                    param.query = searchText || undefined

                    $scope.api.search({params: param, errorMessage: true}).success($scope.onGetList)
                }
            }
        }
    })
