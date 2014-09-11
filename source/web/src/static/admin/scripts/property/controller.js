/* Created by frank on 14-8-15. */


(function () {

    function ctrlProperty($scope, $state, api, enumApi) {

        enumApi.getAll({
            params: {type: 'property_type'},
            errorMessage: 'Update failed'
        }).success(function (data) {
            $scope.propertyTypeList = data.val
        })
        enumApi.getAll({
            params: {type: 'intention'},
            errorMessage: 'Update failed'
        }).success(function (data) {
            $scope.intentionList = data.val
        })
        enumApi.getAll({
            params: {type: 'equity_type'},
            errorMessage: 'Update failed'
        }).success(function (data) {
            $scope.equityTypeList = data.val
        })
        enumApi.getAll({
            params: {type: 'decorative_style'},
            errorMessage: 'Update failed'
        }).success(function (data) {
            $scope.decorativeStyleList = data.val
        })
        enumApi.getAll({
            params: {type: 'facing_direction'},
            errorMessage: 'Update failed'
        }).success(function (data) {
            $scope.facingDirectionList = data.val
        })
        $scope.item = {}

        $scope.submit = function ($event, form) {
            $event.preventDefault()
            $scope.submitted = true
            $scope.loading = true
            console.log($scope.item)
            api.create($scope.item, {
                successMessage: 'Update successfully',
                errorMessage: 'Update failed'
            }).success(function () {
                if ($scope.$parent.currentPageNumber === 1) {
                    $scope.$parent.refreshList()
                }
                $state.go('^')
            })['finally'](function () {
                $scope.loading = false
            })
        }

        $scope.addHighlight = function () {
            if (!$scope.item.highlight) {
                $scope.item.highlight = []
            }
            var temp = $scope.item.tempPoint
            $scope.item.highlight.push(temp)
            $scope.item.tempPoint = null
        }

        $scope.addHistoricalPrice = function () {
            if (!$scope.item.historical_price) {
                $scope.item.historical_price = []
            }
            var temp = {time: $scope.item.tempHistoryTime, price: $scope.item.tempHistoryPrice}
            $scope.item.historical_price.push(temp)
            $scope.item.tempHistoryTime = null
            $scope.item.tempHistoryPrice = null
        }

        $scope.addCost = function () {
            if (!$scope.item.estimated_monthly_cost) {
                $scope.item.estimated_monthly_cost = []
            }
            var temp = {item: $scope.item.tempCostItem, price: $scope.item.tempCostPrice}
            $scope.item.estimated_monthly_cost.push(temp)
            $scope.item.tempCostItem = null
            $scope.item.tempCostPrice = null
        }

        $scope.addHouse = function () {
            if (!$scope.item.main_house_types) {
                $scope.item.main_house_types = []
            }
            var temp = {name: $scope.item.tempHouseName,
                bedroom_count: $scope.item.tempBedroomCount,
                living_room_count: $scope.item.tempLivingRoomCount,
                bathroom_count: $scope.item.tempBathroomCount,
                kitchen_count: $scope.item.tempKitchenCount,
                total_price: $scope.item.tempTotalPrice,
                floor_plan: $scope.item.tempFloorPlan}
            $scope.item.main_house_types.push(temp)
            $scope.item.tempHouseName = null
            $scope.item.tempBedroomCount = null
            $scope.item.tempLivingRoomCount = null
            $scope.item.tempBathroomCount = null
            $scope.item.tempKitchenCount = null
            $scope.item.tempTotalPrice = null
            $scope.item.tempFloorPlan = null
        }
    }

    angular.module('app').controller('ctrlProperty', ctrlProperty)

})()

