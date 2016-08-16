(function () {

    function ctrlStatistics_latest_query_keywords($scope, fctModal, api, $stateParams) {

        $scope.currentPageNumber = 0
        $scope.cachePages = []
        $scope.perPage = 12
        
        $scope.search = function () {
            var params = {per_page: $scope.perPage}
            api.searchLastestQueryKeywords({ params: params }).success(onRefresh)
        }
        function onRefresh(data) {
            $scope.list = data.val
            $scope.place_holder = '无'
            $scope.cachePages[$scope.currentPageNumber] = $scope.list
        }

        $scope.nextPage = function () {
            var lastItem = $scope.list[$scope.list.length - 1]
            var params = {per_page: $scope.perPage}
            if (lastItem && lastItem.time) {
                params.time = lastItem.time
            }
            api.searchLastestQueryKeywords({ params: params })
                .success(function () {
                    $scope.currentPageNumber += 1
                })
                .success(onRefresh)
        }

        $scope.prevPage = function () {

            var prevPrevPageNumber = $scope.currentPageNumber - 2
            var prevPrevPageData
            var lastItem
            if (prevPrevPageNumber >= 1) {
                prevPrevPageData = $scope.cachePages[prevPrevPageNumber]
                lastItem = prevPrevPageData[prevPrevPageData.length - 1]
            }

            var params = {per_page: $scope.perPage}
            if (lastItem && lastItem.time) {
                params.time = lastItem.time
            }

            api.searchLastestQueryKeywords({ params: params })
                .success(function () {
                    $scope.currentPageNumber -= 1
                })
                .success(onRefresh)
        }

    }
    angular.module('app').controller('ctrlStatistics_latest_query_keywords', ctrlStatistics_latest_query_keywords)

})()
