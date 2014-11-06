/**
 * Created by Michael on 14/10/22.
 */
(function () {

    function ctrlPlotList($scope, $rootScope, api) {
        $scope.item = {}
        $scope.api = api
        $scope.fetched = false

        $scope.$watch('item.propertyId', function (newValue) {
            if (_.isEmpty(newValue)) {
                return
            }
            api.search({params: {property_id: newValue, _i18n: 'disabled'}}).success(onGetList)
        })

        $scope.onGetList = onGetList

        function onGetList(data) {
            $scope.fetched = true
            $scope.list = data.val

        }

        var isDesc = [false, false, false, false, false, false]

        $scope.sortByName = function (a, b) {
            if (a.name[$rootScope.userLanguage.value] > b.name[$rootScope.userLanguage.value]) {
                return isDesc[0] ? 1 : -1;
            }
            if (a.name[$rootScope.userLanguage.value] < b.name[$rootScope.userLanguage.value]) {
                return isDesc[0] ? -1 : 1;
            }
            return 0;
        }
        $scope.sortByStatus = function (a, b) {
            if (a.status > b.status) {
                return isDesc[1] ? 1 : -1;
            }
            if (a.status < b.status) {
                return isDesc[1] ? -1 : 1;
            }
            return 0;
        }
        $scope.sortBySpace = function (a, b) {
            if (a.space.value > b.space.value) {
                return isDesc[2] ? 1 : -1;
            }
            if (a.space.value < b.space.value) {
                return isDesc[2] ? -1 : 1;
            }
            return 0;
        }
        $scope.sortByTotalPrice = function (a, b) {
            if (a.total_price.value > b.total_price.value) {
                return isDesc[3] ? 1 : -1;
            }
            if (a.total_price.value < b.total_price.value) {
                return isDesc[3] ? -1 : 1;
            }
            return 0;
        }
        $scope.sortByFloor = function (a, b) {
            if (a.floor > b.floor) {
                return isDesc[4] ? 1 : -1;
            }
            if (a.floor < b.floor) {
                return isDesc[4] ? -1 : 1;
            }
            return 0;
        }

        $scope.sortByDescription = function (a, b) {
            if (a.description > b.description) {
                return isDesc[5] ? 1 : -1;
            }
            if (a.description < b.description) {
                return isDesc[5] ? -1 : 1;
            }
            return 0;
        }

        $scope.sort = function (col) {
            if (_.isEmpty($scope.list)) {
                return
            }
            isDesc[col] = !isDesc[col]
            switch (col) {
                case 0:
                    $scope.list.sort($scope.sortByName)
                    break;
                case 1:
                    $scope.list.sort($scope.sortByStatus)
                    break;
                case 2:
                    $scope.list.sort($scope.sortBySpace)
                    break;
                case 3:
                    $scope.list.sort($scope.sortByTotalPrice)
                    break;
                case 4:
                    $scope.list.sort($scope.sortByFloor)
                    break;
                case 5:
                    $scope.list.sort($scope.sortByDescription)
                    break;
            }
        }
    }

    angular.module('app').controller('ctrlPlotList', ctrlPlotList)

})()

