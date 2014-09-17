/* Created by frank on 14-8-15. */


(function () {

    function ctrlEnums($scope, $rootScope, $state, $stateParams, api) {
        $scope.enums = []
        $scope.item = {}

        $scope.getEnums = function () {
            for (var i = 0; i < $rootScope.enum_types.length; i += 1) {
                getEnumByType(i)
            }
        }
        function getEnumByType(index) {
            api.getEnumsByType($rootScope.enum_types[index].value)
                .success(function (data) {
                    $scope.enums[index] = data.val || {}
                })
        }
        $scope.getEditEnumItem = function () {
            api.getI18nEnumsById($stateParams.id)
                .success(function (data) {
                    $scope.item = data.val || {}
                    $scope.item.tempValues = _.pairs($scope.item.value)
                    for (var i = $scope.item.tempValues.length - 1; i >= 0; i -= 1) {
                        if ($scope.item.tempValues[i][0] === '_i18n') {
                            $scope.item.tempValues.splice(i, 1)
                        } else {
                            $scope.onAddLanguage($scope.item.tempValues[i][0])
                        }
                    }
                })
        }
        $scope.addI18nValue = function () {
            if (!$scope.item.tempValues) {
                $scope.item.tempValues = []
            }

            var temp = [ $scope.item.tempI18n, $scope.item.tempValue]
            $scope.item.tempValues.push(temp)
            $scope.item.tempI18n = null
            $scope.item.tempValue = null
        }
        $scope.addI18nEnum = function ($event, form) {

            $scope.item.value = _.object($scope.item.tempValues)
            api.addEnum($scope.item.type, $scope.item.value)
                .success(function () {
                    $scope.item.value = null
                    $scope.item.tempValues = null
                    $scope.item.property_type = null
                })
        }
        $scope.editI18nEnum = function ($event, form) {

            $scope.item.value = _.object($scope.item.tempValues)
            api.editEnum($stateParams.id, $scope.item.type, $scope.item.value)
                .success(function () {
                    $state.go('^')
                })
        }
        $scope.removeI18nValue = function (index) {
            $scope.item.tempValues.splice(index, 1)
        }
    }

    angular.module('app').controller('ctrlEnums', ctrlEnums)

})()

