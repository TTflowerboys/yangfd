(function () {

    function ctrlRentList($scope, fctModal, api, $state) {

        $scope.list = []
        $scope.perPage = 12
        $scope.currentPageNumber = 1
        $scope.pages = []
        $scope.api = api

        $scope.selected = {}
        $scope.selected.status = 'draft'

        var params = {
            status: $scope.selected.status,
            country: $scope.selected.country,
            city: $scope.selected.city,
            property_type: $scope.selected.property_type,
            per_page: $scope.perPage,
            sort: 'mtime,desc'
        }

        function updateParams() {
            params.developer = $scope.selected.developer
            params.status = $scope.selected.status
            params.country = $scope.selected.country
            params.city = $scope.selected.city
            params.property_type = $scope.selected.property_type
            params.mtime = undefined
        }

        $scope.searchRent = function () {
            updateParams()
            api.getAll({
                params: params, errorMessage: true
            }).success(onGetList)
        }

        $scope.refreshList = function () {
            api.getAll({
                params: params, errorMessage: true
            }).success(onGetList)
        }

        $scope.onRemove = function (item) {
            fctModal.show('Do you want to remove it?', undefined, function () {
                api.remove(item.id, {errorMessage: true}).success(function () {
                    $scope.list.splice($scope.list.indexOf(item), 1)
                })
            })
        }

        $scope.nextPage = function () {
            var lastItem = $scope.list[$scope.list.length - 1]
            if (lastItem.last_modified_time) {
                params.last_modified_time = lastItem.last_modified_time
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
                if (lastItem.last_modified_time) {
                    params.last_modified_time = lastItem.last_modified_time
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

            api.getAll({params: params, errorMessage: true})
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


    }

    angular.module('app').controller('ctrlRentList', ctrlRentList)

})()


