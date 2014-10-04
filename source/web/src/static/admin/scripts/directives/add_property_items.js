/**
 * Created by Michael on 14/9/20.
 */
angular.module('app')
    .directive('addPropertyItems', function ($rootScope) {
        return {
            restrict: 'AE',
            link: function (scope) {

                scope.addHighlight = function () {
                    if (_.isEmpty(scope.item.highlight)) {
                        scope.item.highlight = {}
                    }
                    if (!scope.item.highlight[$rootScope.userLanguage.value]) {
                        scope.item.highlight[$rootScope.userLanguage.value] = []
                    }
                    var temp = scope.item.tempPoint
                    scope.item.highlight[$rootScope.userLanguage.value].push(angular.copy(temp))
                    scope.item.tempPoint = undefined
                }

                scope.addHistoricalPrice = function () {
                    if (!scope.item.historical_price) {
                        scope.item.historical_price = []
                    }
                    var temp = {time: scope.item.tempHistoryTime, price: scope.item.tempHistoryPrice}
                    scope.item.historical_price.push(angular.copy(temp))
                    scope.item.tempHistoryPrice.value = undefined
                }

                scope.addCost = function () {
                    if (!scope.item.estimated_monthly_cost) {
                        scope.item.estimated_monthly_cost = []
                    }
                    var temp = {item: scope.item.tempCostItem, price: scope.item.tempCostPrice}
                    scope.item.estimated_monthly_cost.push(angular.copy(temp))
                    scope.item.tempCostItem = {}
                    scope.item.tempCostPrice.value = undefined
                }

                scope.addHouse = function () {
                    if (!scope.item.main_house_types) {
                        scope.item.main_house_types = []
                    }
                    var temp = {name: scope.item.tempHouseName,
                        bedroom_count: scope.item.tempBedroomCount,
                        living_room_count: scope.item.tempLivingRoomCount,
                        bathroom_count: scope.item.tempBathroomCount,
                        kitchen_count: scope.item.tempKitchenCount,
                        space: scope.item.tempSpace,
                        total_price: angular.copy(scope.item.tempTotalPrice),
                        floor_plan: scope.item.tempFloorPlan}
                    scope.item.main_house_types.push(angular.copy(temp))
                    scope.item.tempHouseName = {}
                    scope.item.tempBedroomCount = undefined
                    scope.item.tempLivingRoomCount = undefined
                    scope.item.tempBathroomCount = undefined
                    scope.item.tempKitchenCount = undefined
                    scope.item.tempSpace = undefined
                    scope.item.tempTotalPrice.value = undefined
                    scope.item.tempFloorPlan = {}
                }
            }
        }
    })