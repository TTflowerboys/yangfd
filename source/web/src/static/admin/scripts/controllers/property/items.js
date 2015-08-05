/**
 * Created by Michael on 14/10/10.
 */
(function () {

    function ctrlPropertyItems($scope, $rootScope, apiFactory) {
        /*var isInit = true
        $scope.$watch('item.zipcode', function (newValue) {
            if (isInit) {
                if (newValue) {
                    isInit = false
                    return
                }
            }
            var temp = newValue ? newValue.toUpperCase() : ''
            if (temp.length > 3) {
                $scope.item.zipcode_index = temp.substring(0, 3).trim()
            } else {
                $scope.item.zipcode_index = temp.trim()
            }
        })

        $scope.$watch('item.zipcode_index', function (newValue) {
            if (newValue && newValue.length > 1) {
                apiFactory('report').search({params: {zipcode_index: newValue}}).success(function (data) {
                    var res = data.val
                    if (res && res.length > 0) {
                        $scope.zipcode_name = res[0].name
                        $scope.item.report_id = res[0].id
                    } else {
                        $scope.zipcode_name = i18n('暂无此街区')
                    }
                })
            }
        })*/

        $scope.addHighlight = function () {
            if (_.isEmpty($scope.item.highlight)) {
                $scope.item.highlight = {}
            }
            if (!$scope.item.highlight[$rootScope.userLanguage.value]) {
                $scope.item.highlight[$rootScope.userLanguage.value] = []
            }
            $scope.item.highlight[$rootScope.userLanguage.value].push('')
        }

        $scope.addHistoricalPrice = function () {
            if (!$scope.item.historical_price) {
                $scope.item.historical_price = []
            }
            var temp = {time: '', price: {}}
            $scope.item.historical_price.push(temp)
        }

        $scope.addCost = function () {
            if (!$scope.item.estimated_monthly_cost) {
                $scope.item.estimated_monthly_cost = []
            }
            var temp = {item: {}, price: {}}
            $scope.item.estimated_monthly_cost.push(temp)
        }

        $scope.addHouse = function () {
            if (!$scope.item.main_house_types) {
                $scope.item.main_house_types = []
            }
            var temp = {
                name: {},
                bedroom_count: 0,
                living_room_count: 0,
                bathroom_count: 0,
                kitchen_count: 0,
                building_area_min: {},
                building_area_max: {},
                total_price_min: {},
                total_price_max: {},
                floor_plan: {}
            }
            $scope.item.main_house_types.push(temp)
        }

        $scope.onRemoveHighlight = function (index) {
            $scope.item.highlight[$rootScope.userLanguage.value].splice(index, 1)
        }

        $scope.onRemoveHistoricalPrice = function (index) {
            $scope.item.historical_price.splice(index, 1)
        }

        $scope.onRemoveCost = function (index) {
            $scope.item.estimated_monthly_cost.splice(index, 1)
        }

        $scope.onRemoveHouse = function (index) {
            $scope.item.main_house_types.splice(index, 1)
        }

        $scope.getTabTitle = function (type) {
            switch (type) {
                case 'student_housing':
                    return i18n('学生公寓信息')
                case 'house':
                    return i18n('别墅信息')
                default :
                    return i18n('楼盘信息')
            }
        }
    }

    angular.module('app').controller('ctrlPropertyItems', ctrlPropertyItems)

})()