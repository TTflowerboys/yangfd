/**
 * Created by zhou on 15-1-13.
 */

(function () {

    function ctrlCrowdfundingList($scope, fctModal, api, $state, $stateParams) {

        $scope.list = []
        $scope.perPage = 12
        $scope.currentPageNumber = 1
        $scope.pages = []
        $scope.api = api

        $scope.selected = {}
        $scope.selected.status = 'new'
        var params = {
            status: $scope.selected.status,
            per_page: $scope.perPage,
            sort: 'mtime,desc'
        }

        function updateParams() {
            $stateParams.shop_id = $scope.selected.shopId
            params.status = $scope.selected.status
            params.mtime = undefined
        }

        $scope.searchItem = function () {
            updateParams()
            api.getAll($stateParams.shop_id, {
                params: params, errorMessage: true
            }).success(onGetList)
        }

        $scope.refreshList = function () {
            api.getAll($stateParams.shop_id, {
                params: params, errorMessage: true
            }).success(onGetList)
        }

        $scope.onRemove = function (item) {
            fctModal.show('Do you want to remove it?', undefined, function () {
                api.remove($stateParams.shop_id, item.id, {errorMessage: true}).success(function () {
                    $scope.list.splice($scope.list.indexOf(item), 1)
                })
            })
        }

        $scope.nextPage = function () {
            var lastItem = $scope.list[$scope.list.length - 1]
            if (lastItem.mtime) {
                params.mtime = lastItem.mtime
            }
            if (lastItem.register_time) {
                params.register_time = lastItem.register_time
            }
            if (lastItem.insert_time) {
                params.insert_time = lastItem.insert_time
            }

            api.getAll($stateParams.shop_id, {params: params})
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
                if (lastItem.mtime) {
                    params.mtime = lastItem.mtime
                }
                if (lastItem.register_time) {
                    params.register_time = lastItem.register_time
                }
                if (lastItem.insert_time) {
                    params.insert_time = lastItem.insert_time
                }
            } else {
                delete params.mtime
                delete params.register_time
                delete params.insert_time
            }

            api.getAll($stateParams.shop_id, {params: params, errorMessage: true})
                .success(function () {
                    $scope.currentPageNumber -= 1
                })
                .success(onGetList)

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

        $scope.toEditProperty = function (id) {
            var result = id;
            api.getAll($stateParams.shop_id, {
                params: {
                    target_property_id: id,
                    status: 'draft,not translated,translating,not reviewed,rejected'
                }, errorMessage: true
            })
                .success(function (data) {
                    var res = data.val.content
                    if (!_.isEmpty(res)) {
                        result = res[0].id
                    }
                })['finally'](function () {
                $state.go('.edit', {id: result})
            })
        }

    }

    angular.module('app').controller('ctrlCrowdfundingList', ctrlCrowdfundingList)

})()


