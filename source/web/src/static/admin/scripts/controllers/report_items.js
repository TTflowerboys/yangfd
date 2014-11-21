/**
 * Created by Michael on 14/11/14.
 */
(function () {

    function ctrlReportItems($scope, $rootScope, enumApi) {

        enumApi.getEnumsByType('school_type')
            .success(function (data) {
                $scope.schoolTypeList = data.val || {}
            })

        enumApi.getEnumsByType('school_grade')
            .success(function (data) {
                $scope.gradeTypeList = data.val || {}
            })
        enumApi.getEnumsByType('facilities')
            .success(function (data) {
                $scope.facilitiesList = data.val || {}
            })
        $scope.addSchool = function () {
            if (!$scope.item.schools) {
                $scope.item.schools = []
            }
            var temp = {}
            $scope.item.schools.push(temp)
        }

        $scope.addRailway = function () {
            if (!$scope.item.railway_lines) {
                $scope.item.railway_lines = []
            }
            var temp = { distance: {}}
            $scope.item.railway_lines.push(temp)
        }

        $scope.addBusStation = function () {
            if (!$scope.item.bus_lines) {
                $scope.item.bus_lines = []
            }
            var temp = { distance: {}}
            $scope.item.bus_lines.push(temp)
        }

        $scope.addCarRental = function () {
            if (!$scope.item.car_rental_location) {
                $scope.item.car_rental_location = []
            }
            var temp = {
                distance: {}
            }
            $scope.item.car_rental_location.push(temp)
        }
        $scope.addBicycleRental = function () {
            if (!$scope.item.bicycle_rental_location) {
                $scope.item.bicycle_rental_location = []
            }
            var temp = {
                distance: {}
            }
            $scope.item.bicycle_rental_location.push(temp)
        }
        $scope.addFacilities = function () {
            if (!$scope.item.facilities) {
                $scope.item.facilities = []
            }
            var temp = {
                distance: {}
            }
            $scope.item.facilities.push(temp)
        }

        $scope.onRemoveSchool = function (index) {
            $scope.item.schools.splice(index, 1)
        }

        $scope.onRemoveRailway = function (index) {
            $scope.item.historical_price.splice(index, 1)
        }

        $scope.onRemoveBusStation = function (index) {
            $scope.item.bus_lines.splice(index, 1)
        }

        $scope.onRemoveCarRental = function (index) {
            $scope.item.car_rental_location.splice(index, 1)
        }

        $scope.onRemoveBicycleRental = function (index) {
            $scope.item.bicycle_rental_location.splice(index, 1)
        }

        $scope.onRemoveFacilities = function (index) {
            $scope.item.facilities.splice(index, 1)
        }
    }

    angular.module('app').controller('ctrlReportItems', ctrlReportItems)

})()