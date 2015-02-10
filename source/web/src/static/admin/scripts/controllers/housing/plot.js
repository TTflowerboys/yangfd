/**
 * Created by Michael on 14/11/10.
 */
(function () {

    function ctrlHousingPlot($scope, $stateParams, api, $rootScope) {
        $scope.item = {}
        $scope.list = []
        $scope.api = api
        $scope.fetched = false
        $scope.selected = {}

        var params = $rootScope.plotParams || {}
        $scope.selected.bedroom_count = params.bedroom_count
        $scope.selected.living_room_count = params.living_room_count
        $scope.selected.kitchen_count = params.kitchen_count
        $scope.selected.bathroom_count = params.bathroom_count
        $scope.selected.zipcode_index = params.zipcode_index
        $scope.selected.floor = params.floor
        if (params.space) {
            var index1 = params.space.indexOf(',')
            var index2 = params.space.lastIndexOf(',')
            $scope.selected.min_square = parseInt(params.space.substring(0, index1), 10)
            $scope.selected.max_square = parseInt(params.space.substring(index1 + 1, index2), 10)
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