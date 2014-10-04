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
                    scope.item.highlight[$rootScope.userLanguage.value].push('')
                }

                scope.addHistoricalPrice = function () {
                    if (!scope.item.historical_price) {
                        scope.item.historical_price = []
                    }
                    var temp = {time: '', price: {}}
                    scope.item.historical_price.push(temp)
                }

                scope.addCost = function () {
                    if (!scope.item.estimated_monthly_cost) {
                        scope.item.estimated_monthly_cost = []
                    }
                    var temp = {item: {}, price: {}}
                    scope.item.estimated_monthly_cost.push(temp)
                }

                scope.addHouse = function () {
                    if (!scope.item.main_house_types) {
                        scope.item.main_house_types = []
                    }
                    var temp = {name: '',
                        bedroom_count: 0,
                        living_room_count: 0,
                        bathroom_count: 0,
                        kitchen_count: 0,
                        space: {},
                        total_price: {},
                        floor_plan: {}}
                    scope.item.main_house_types.push(temp)
                }

                scope.onRemoveHighlight = function (index) {
                    scope.item.highlight[$rootScope.userLanguage.value].splice(index, 1)
                }

                scope.onRemoveHistoricalPrice = function (index) {
                    scope.item.historical_price.splice(index, 1)
                }

                scope.onRemoveCost = function (index) {
                    scope.item.estimated_monthly_cost.splice(index, 1)
                }

                scope.onRemoveHouse = function (index) {
                    scope.item.main_house_types.splice(index, 1)
                }
            }
        }
    })