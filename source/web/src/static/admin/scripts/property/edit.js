/**
 * Created by Michael on 14/9/17.
 */

(function () {

    function ctrlPropertyEdit($scope, $state, api, $stateParams, enumApi, $rootScope, i18nLanguages, misc, growl) {

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

        var itemFromParent = misc.findById($scope.$parent.list, $stateParams.id)


        if (itemFromParent) {
            onGetItem(itemFromParent)
        } else {
            api.getOne($stateParams.id)
                .success(function (data) {
                    onGetItem(data.val)
                })
        }


        function onGetItem(item) {

            $scope.itemOrigin = item
            $scope.item = angular.copy($scope.itemOrigin)
        }


        $scope.submit = function ($event, form) {
            $event.preventDefault()
            $scope.submitted = true

            var changed = misc.getChangedAttributes($scope.item, $scope.itemOrigin)
            if (!changed) {
                growl.addWarnMessage('Nothing to update')
                return
            }

            $scope.loading = true

            api.update(angular.extend(changed, {id: $scope.item.id}), {
                successMessage: 'Update successfully',
                errorMessage: 'Update failed'
            }).success(function () {
                angular.extend($scope.itemOrigin, changed)
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

    angular.module('app').controller('ctrlPropertyEdit', ctrlPropertyEdit)

})()

