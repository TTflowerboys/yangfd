/**
 * Created by zhou on 15-1-23.
 */
(function () {

    function ctrlOrderSearch($scope, api, fctModal) {

        $scope.selected = {}

        $scope.list = []
        $scope.perPage = 6
        $scope.currentPageNumber = 1
        $scope.pages = []
        $scope.api = api
        $scope.fetched = false

        var params = {
            per_page: $scope.perPage
        }

        api.getAll({params: params}).success(onGetList)

        $scope.refreshList = function () {
            api.getAll({params: params}).success(onGetList)
        }

        $scope.onRemove = function (item) {
            fctModal.show('Do you want to remove it?', undefined, function () {
                api.remove(item.id).success(function () {
                    $scope.list.splice($scope.list.indexOf(item), 1)
                })
            })
        }

        $scope.nextPage = function () {
            var lastItem = $scope.list[$scope.list.length - 1]
            if (lastItem.time) {
                params.time = lastItem.time
            }
            if (lastItem.register_time) {
                params.register_time = lastItem.register_time
            }
            if (lastItem.insert_time) {
                params.insert_time = lastItem.insert_time
            }

            api.getAll({params: params})
                .success(function () {
                    $scope.currentPageNumber += 1
                })
                .success(onGetList)

        }
        $scope.prevPage = function () {

            var prevPrevPageNumber = $scope.currentPageNumber - 2
            var prevPrevPageData
            var lastItem
            if (prevPrevPageNumber >= 1) {
                prevPrevPageData = $scope.pages[prevPrevPageNumber]
                lastItem = prevPrevPageData[prevPrevPageData.length - 1]
            }

            if (lastItem) {
                if (lastItem.time) {
                    params.time = lastItem.time
                }
                if (lastItem.register_time) {
                    params.register_time = lastItem.register_time
                }
                if (lastItem.insert_time) {
                    params.insert_time = lastItem.insert_time
                }
            } else {
                delete params.time
                delete params.register_time
                delete params.insert_time
            }

            api.getAll({params: params})
                .success(function () {
                    $scope.currentPageNumber -= 1
                })
                .success(onGetList)

        }

        $scope.onGetList = onGetList

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

        function updateParams() {
            if (isNaN($scope.selected.starttime)) { $scope.selected.starttime = 0; }
            if ($scope.selected.starttime === undefined || $scope.selected.starttime === '' || $scope.selected.starttime === 0) {
                delete params.starttime
            } else {
                params.starttime = $scope.selected.starttime;
            }
            if (isNaN($scope.selected.endtime)) { $scope.selected.endtime = 0; }

            if ($scope.selected.endtime === undefined || $scope.selected.endtime === '' || $scope.selected.endtime === 0) {
                delete params.time
            } else {
                if ($scope.selected.endtime % 100 === 0) {
                    $scope.selected.endtime += 86399
                }
                params.time = $scope.selected.endtime;
            }
            if ($scope.selected.status === undefined || $scope.selected.status === '') {
                delete params.status
            } else {
                params.status = $scope.selected.status;
            }
        }

        $scope.searchOrder = function () {
            updateParams()
            $scope.refreshList()
        }
    }

    angular.module('app').controller('ctrlOrderSearch', ctrlOrderSearch)

})()

