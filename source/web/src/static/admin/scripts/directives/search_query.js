/* Created by chaowang on 14-9-23. */
angular.module('app')
    .directive('searchQuery', function () {
        return {
            restrict: 'AE',
            templateUrl: '/static/admin/templates/search_user_query.tpl.html',
            link: function ($scope, elm, attrs) {
                $scope.onSearch = function (searchText) {
                    var param = {}
                    param.query =  searchText || undefined

                    $scope.api.search({params: param, errorMessage: true}).success(onGetList)
                }

                function onGetList(data) {
                    $scope.fetched = true
                    $scope.list = data.val
                    $scope.pages[$scope.currentPageNumber] = $scope.list

                    if (!$scope.list || $scope.list.length < $scope.perPage) {
                        $scope.noNext = true
                    } else {
                        $scope.noNext = false
                    }
                    if ($scope.currentPageNumber <= 1) {
                        $scope.noPrev = true
                    } else {
                        $scope.noPrev = false
                    }
                }
            }
        }
    })
