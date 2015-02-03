/**
 * Created by Michael on 14/11/10.
 */
(function () {

    function ctrlHousingPlot($scope, $stateParams, api, $rootScope) {
        $scope.item = {}
        $scope.api = api
        $scope.fetched = false
        $scope.selected = {}

        var params = $rootScope.plotParams || {}
        $scope.selected.bedroom_count = params.bedroom_count
        $scope.selected.floor = params.floor
        if (params.building_area) {
            var index1 = params.building_area.indexOf(',')
            var index2 = params.building_area.lastIndexOf(',')
            $scope.selected.min_square = parseInt(params.building_area.substring(0, index1), 10)
            $scope.selected.max_square = parseInt(params.building_area.substring(index1 + 1, index2), 10)
            params.space = params.building_area
        }
        if (params.price) {
            var index3 = params.price.indexOf(',')
            var index4 = params.price.lastIndexOf(',')
            $scope.selected.min_money = parseInt(params.price.substring(0, index3), 10)
            $scope.selected.max_money = parseInt(params.price.substring(index3 + 1, index4), 10)
        }

        function updateParams() {
            if ($scope.selected.bedroom_count === undefined || $scope.selected.bedroom_count === '' || $scope.selected.bedroom_count === null) {
                delete params.bedroom_count
            } else {
                params.bedroom_count = $scope.selected.bedroom_count
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
        }

        $scope.searchPlot = function () {
            updateParams()
            api.search({
                params: angular.extend({property_id: $stateParams.id, _i18n: 'disabled'}, params)
            }).success(onGetList)
        }

        api.search({
            params: angular.extend({property_id: $stateParams.id, _i18n: 'disabled'}, $rootScope.plotParams)
        }).success(onGetList)

        $scope.onGetList = onGetList

        function onGetList(data) {
            $scope.fetched = true
            $scope.list = data.val

        }

    }

    angular.module('app').controller('ctrlHousingPlot', ctrlHousingPlot)

})()