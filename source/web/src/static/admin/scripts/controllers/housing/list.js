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
            if ($scope.selected.bedroom_count === undefined || $scope.selected.bedroom_count === '' || $scope.selected.bedroom_count === null) {
                delete params.bedroom_count
            } else {
                params.bedroom_count = $scope.selected.bedroom_count
            }
            params.floor = $scope.selected.floor
            if($scope.selected.min_square||$scope.selected.max_square){
                if($rootScope.userArea.value){
                    params.building_area = ($scope.selected.min_square?$scope.selected.min_square:'')+','+($scope.selected.max_square?$scope.selected.max_square:'')+','+$rootScope.userArea.value
                }else{
                    delete params.building_area
                }
            }else{
                delete params.building_area
            }
            if($scope.selected.min_money||$scope.selected.max_money){
                if($rootScope.userCurrency.value){
                    params.price = ($scope.selected.min_money?$scope.selected.min_money:'')+','+($scope.selected.max_money?$scope.selected.max_money:'')+','+$rootScope.userCurrency.value
                }else{
                    delete params.price
                }
            }else{
                delete params.price
            }
            $rootScope.plotParams = params;
        }

        $scope.searchHousing = function () {
            updateParams()
            api.getAll({
                params: params, errorMessage: true
            }).success(onGetList)
        }

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
            if (lastItem.mtime) {
                params.mtime = lastItem.mtime
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
                if (lastItem.mtime) {
                    params.mtime = lastItem.mtime
                }
            } else {
                delete params.mtime
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

