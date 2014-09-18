/* Created by frank on 14-8-15. */


(function () {

    function ctrlPropertyCreate($scope, $state, api, enumApi, $rootScope, i18nLanguages) {

        enumApi.getEnumsByType('property_type')
            .success(function (data) {
                $scope.propertyTypeList = data.val
            })
        enumApi.getEnumsByType('intention')
            .success(function (data) {
                $scope.intentionList = data.val
            })
        enumApi.getEnumsByType('equity_type')
            .success(function (data) {
                $scope.equityTypeList = data.val
            })
        enumApi.getEnumsByType('decorative_style')
            .success(function (data) {
                $scope.decorativeStyleList = data.val
            })
        enumApi.getEnumsByType('facing_direction')
            .success(function (data) {
                $scope.facingDirectionList = data.val
            })
        enumApi.getEnumsByType('property_price_type')
            .success(function (data) {
                $scope.propertyPriceTypeList = data.val
            })
        $scope.item = {}

        $scope.submit = function ($event, form) {
            $event.preventDefault()
            $scope.submitted = true
            $scope.loading = true
            for (var i in $scope.item) {
                if (_.isEmpty($scope.item[i]) || $scope.item[i].value === '') {
                    delete $scope.item[i]
                }
            }

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
            if (!$scope.item.highlight[$rootScope.userLanguage.value]) {
                $scope.item.highlight[$rootScope.userLanguage.value] = []
            }
            var temp = $scope.item.tempPoint
            $scope.item.highlight[$rootScope.userLanguage.value].push(temp)
            $scope.item.tempPoint = null
        }

        $scope.addHistoricalPrice = function () {
            if (!$scope.item.historical_price) {
                $scope.item.historical_price = []
            }
            var temp = {time: $scope.item.tempHistoryTime, price: $scope.item.tempHistoryPrice}
            $scope.item.historical_price.push(temp)
            $scope.item.tempHistoryTime = null
            $scope.item.tempHistoryPrice = {}
        }

        $scope.addCost = function () {
            if (!$scope.item.estimated_monthly_cost) {
                $scope.item.estimated_monthly_cost = []
            }
            var temp = {item: $scope.item.tempCostItem, price: $scope.item.tempCostPrice}
            $scope.item.estimated_monthly_cost.push(angular.copy(temp))
            $scope.item.tempCostItem = {}
            $scope.item.tempCostPrice.value = ''
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
            $scope.item.tempHouseName = {}
            $scope.item.tempBedroomCount = null
            $scope.item.tempLivingRoomCount = null
            $scope.item.tempBathroomCount = null
            $scope.item.tempKitchenCount = null
            $scope.item.tempTotalPrice = {}
            $scope.item.tempFloorPlan = {}
        }

    }

    angular.module('app').controller('ctrlPropertyCreate', ctrlPropertyCreate)

})()

