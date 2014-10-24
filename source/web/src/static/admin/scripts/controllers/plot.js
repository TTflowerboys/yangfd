/**
 * Created by Michael on 14/10/22.
 */
(function () {

    function ctrlPlotList($scope, $state, $http, $rootScope, $stateParams, fctModal, propertyApi, enumApi, api) {
        $scope.item = {}

        $scope.list = []
        $scope.currentPageNumber = 1
        $scope.pages = []
        $scope.api = api
        $scope.fetched = false
        $scope.propertyList

        enumApi.getEnumsByType('property_type').success(function (data) {
            var list = data.val
            var res
            for (var item in list) {
                if (list[item].slug === 'new_property' || list[item].slug === 'student_housing') {
                    if (res) {
                        res += ',' + list[item].id
                    } else {
                        res = list[item].id
                    }
                }
            }
            propertyApi.getAll({params: {property_type: res, status: 'selling'}}).success(function (data) {
                $scope.propertyList = data.val.content
            })
        })

        $scope.onPropertyChange = function () {
            api.search({ params: {property_id: $scope.item.propertyId}}).success(onGetList)
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

            api.search({params: params})
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

            api.search({params: params})
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

    }

    angular.module('app').controller('ctrlPlotList', ctrlPlotList)

})()

