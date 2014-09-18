/* Created by frank on 14-8-15. */


(function () {

    function ctrlPropertyCreate($scope, $state, api, enumApi,geoApi, $rootScope, i18nLanguages) {

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
        geoApi.getCountries({params:{_i18n:'disabled'}})
            .success(function(data){
                console.log(data.val)
                $scope.systemCountries = data.val
            })
        $scope.item = {}

        $scope.submit = function ($event, form) {
            $event.preventDefault()
            $scope.submitted = true
            $scope.loading = true
            formatData()
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
                total_price: angular.copy($scope.item.tempTotalPrice),
                floor_plan: $scope.item.tempFloorPlan}
            $scope.item.main_house_types.push(temp)
            $scope.item.tempHouseName = {}
            $scope.item.tempBedroomCount = null
            $scope.item.tempLivingRoomCount = null
            $scope.item.tempBathroomCount = null
            $scope.item.tempKitchenCount = null
            $scope.item.tempTotalPrice.value = ''
            $scope.item.tempFloorPlan = {}
        }

        function formatData() {
            for (var i in $scope.item) {
                if (_.isEmpty($scope.item[i])) {
                    delete $scope.item[i]
                    continue
                }
                if ($scope.item[i].unit === undefined) {
                    for (var index in i18nLanguages) {
                        var lang = i18nLanguages[index].value
                        if ($scope.item[i][lang] === undefined || $scope.item[i][lang] === '') {
                            delete $scope.item[i][lang]
                        }
                    }
                    if (_.isEmpty($scope.item[i])) {
                        delete $scope.item[i]
                        continue
                    }
                } else {
                    if (_.isString($scope.item[i].unit)) {
                        console.log(_.isEmpty($scope.item[i].value))
                        console.log($scope.item[i].value === '')
                        if (_.isEmpty($scope.item[i].value) || $scope.item[i].value === '') {
                            delete $scope.item[i]
                            continue
                        }
                    } else {
                        if (_.isString($scope.item[i].unit.unit) && _.isString($scope.item[i].price.unit)) {
                            if (_.isEmpty($scope.item[i].unit.value) || $scope.item[i].unit.value === '' || _.isEmpty($scope.item[i].price.value) || $scope.item[i].price.value === '') {
                                delete $scope.item[i]
                                continue
                            }
                        }
                    }
                }
            }
            cleanTempData()
        }

        function cleanTempData() {
            $scope.item.tempHouseName = undefined
            $scope.item.tempBedroomCount = undefined
            $scope.item.tempLivingRoomCount = undefined
            $scope.item.tempBathroomCount = undefined
            $scope.item.tempKitchenCount = undefined
            $scope.item.tempTotalPrice = undefined
            $scope.item.tempFloorPlan = undefined
            $scope.item.tempCostItem = undefined
            $scope.item.tempCostPrice = undefined
            $scope.item.tempCostItem = undefined
            $scope.item.tempCostPrice = undefined
            $scope.item.tempHistoryTime = undefined
            $scope.item.tempHistoryPrice = undefined
            $scope.item.tempPoint = undefined
        }

        $scope.$watch('item.country',function(newValue){
            console.log(newValue)
            if(newValue===undefined){
                return
            }
            geoApi.getCitiesByCountry({params:{_i18n:'disabled',country:newValue}})
                .success(function(data){
                    console.log(data.val)
                    $scope.systemCities = data.val
                })
        })
    }

    angular.module('app').controller('ctrlPropertyCreate', ctrlPropertyCreate)

})()

