/* Created by frank on 14-8-15. */


(function () {

    function ctrlUserList($scope, fctModal, api) {
        $scope.list = []
        $scope.selected = {}

        $scope.selected.per_page = 12
        $scope.currentPageNumber = 1
        $scope.pages = []
        $scope.api = api
        $scope.fetched = false

        var params = $scope.selected
        $scope.$watch(function () {
            return [$scope.selected.country, $scope.selected.user_type, $scope.selected.occupation].join(',')
        }, function () {
            $scope.refreshList()
        })
        api.getAll({params: params}).success(onGetList)

        $scope.refreshList = function () {
            _.each(params, function (val, key) {
                if(val === '') {
                    delete params[key]
                }
            })
            api.getAll({params: params}).success(onGetList)
        }

        $scope.onSuspend = function (item) {
            fctModal.show('Do you want to suspend it?', undefined, function () {
                api.suspend(item.id).success(function () {
                    $scope.refreshList()
                })
            })
        }

        $scope.onActivate = function (item) {
            fctModal.show('Do you want to activate it?', undefined, function () {
                api.activate(item.id).success(function () {
                    $scope.refreshList()
                })
            })
        }

        $scope.nextPage = function () {
            var lastItem = $scope.list[$scope.list.length - 1]
            if (lastItem.time) {
                params.time = lastItem.time
            }
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
                if (lastItem.time) {
                    params.time = lastItem.time
                }
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
                delete params.time
                delete params.last_modified_time
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

            if (!$scope.list || $scope.list.length < $scope.selected.per_page) {
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
        $scope.updateItem = function (item) {
            api.update(item.id, item)
                .success(function () {
                    $scope.refreshList()
                })
        }

    }

    angular.module('app').controller('ctrlUserList', ctrlUserList)

})()

