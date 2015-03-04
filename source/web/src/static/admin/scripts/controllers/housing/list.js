/**
 * Created by Michael on 14/10/28.
 */
(function () {

    function ctrlHousingList($scope, fctModal, api, $rootScope) {
        $scope.list = []
        $scope.perPage = 12
        $scope.currentPageNumber = 1
        $scope.pages = []
        $scope.api = api
        $scope.fetched = false
        $scope.selected = {}

        var params = {
            country: $scope.selected.country,
            city: $scope.selected.city,
            property_type: $scope.selected.property_type,
            per_page: $scope.perPage,
            sort: 'mtime,desc'
        }

        function updateParams() {
            params.country = $scope.selected.country
            params.city = $scope.selected.city
            params.property_type = $scope.selected.property_type
            params.intention = $scope.selected.intention
            params.investment_type = $scope.selected.investment_type
            params.developer = $scope.selected.developer
            if ($scope.selected.bedroom_count === undefined || $scope.selected.bedroom_count === '' || $scope.selected.bedroom_count === null) {
                delete params.bedroom_count
            } else {
                params.bedroom_count = $scope.selected.bedroom_count
            }
            if ($scope.selected.living_room_count === undefined || $scope.selected.living_room_count === '' || $scope.selected.living_room_count === null) {
                delete params.living_room_count
            } else {
                params.living_room_count = $scope.selected.living_room_count
            }
            if ($scope.selected.kitchen_count === undefined || $scope.selected.kitchen_count === '' || $scope.selected.kitchen_count === null) {
                delete params.kitchen_count
            } else {
                params.kitchen_count = $scope.selected.kitchen_count
            }
            if ($scope.selected.bathroom_count === undefined || $scope.selected.bathroom_count === '' || $scope.selected.bathroom_count === null) {
                delete params.bathroom_count
            } else {
                params.bathroom_count = $scope.selected.bathroom_count
            }
            if ($scope.selected.zipcode_index) {
                params.zipcode_index = $scope.selected.zipcode_index
            } else {
                delete params.zipcode_index
            }
            if ($scope.selected.floor) {
                params.floor = $scope.selected.floor
            } else {
                delete params.floor
            }
            if ($scope.selected.min_square || $scope.selected.max_square) {
                if ($rootScope.userArea.value) {
                    params.space = ($scope.selected.min_square ? $scope.selected.min_square : '') + ',' + ($scope.selected.max_square ? $scope.selected.max_square : '') + ',' + $rootScope.userArea.value
                } else {
                    delete params.space
                }
            } else {
                delete params.space
            }
            if ($scope.selected.min_money || $scope.selected.max_money) {
                if ($rootScope.userCurrency.value) {
                    params.price = ($scope.selected.min_money ? $scope.selected.min_money : '') + ',' + ($scope.selected.max_money ? $scope.selected.max_money : '') + ',' + $rootScope.userCurrency.value
                } else {
                    delete params.price
                }
            } else {
                delete params.price
            }
            $rootScope.plotParams = _.pick(params, 'bedroom_count', 'living_room_count', 'kitchen_count',
                'bathroom_count', 'zipcode_index', 'floor', 'space', 'price');
        }

        $scope.searchHousing = function () {
            updateParams()
            api.searchWithPlot({
                params: params, errorMessage: true
            }).success(onGetList)
        }

        $scope.refreshList = function () {
            api.searchWithPlot({params: params}).success(onGetList)
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
            if (lastItem.mtime) {
                params.mtime = lastItem.mtime
            }
            api.searchWithPlot({params: params})
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
            } else {
                delete params.mtime
            }

            api.searchWithPlot({params: params})
                .success(function () {
                    $scope.currentPageNumber -= 1
                })
                .success(onGetList)

        }

        $scope.onGetList = onGetList

        function onGetList(data) {
            $scope.fetched = true
            $scope.list = data.val.content
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

    angular.module('app').controller('ctrlHousingList', ctrlHousingList)

})()

