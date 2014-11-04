/* Created by frank on 14-9-17. */
/* jshint -W083:true */

(function () {

    function ctrlPropertyList($scope, fctModal, api) {

        $scope.list = []
        $scope.perPage = 12
        $scope.currentPageNumber = 1
        $scope.pages = []
        $scope.api = api

        $scope.selected = {}
        $scope.selected.status = 'not reviewed'

        var params = {
            status: $scope.selected.status,
            per_page: $scope.perPage
        }

        $scope.searchProperty = function () {
            api.getAll({
                params: {
                    status: $scope.selected.status,
                    country: $scope.selected.country,
                    city: $scope.selected.city,
                    property_type: $scope.selected.property_type,
                    per_page: $scope.perPage
                }, errorMessage: true
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

            api.getAll({params: params, errorMessage: true})
                .success(function () {
                    $scope.currentPageNumber -= 1
                })
                .success(onGetList)

        }

        function onGetList(data) {
            $scope.fetched = true
            $scope.list = data.val.content
            $scope.pages[$scope.currentPageNumber] = $scope.list
            for (var index in $scope.list) {

                var listItem = $scope.list[index]
                if (listItem.target_property_id) {
                    (function (index) {
                        api.getOne(listItem.target_property_id, {errorMessage: true})
                            .success(function (data) {
                                $scope.list[index] = angular.extend(data.val, $scope.list[index])
                            })
                    })(index)
                }
            }
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

    angular.module('app').controller('ctrlPropertyList', ctrlPropertyList)

})()


