/* Created by frank on 14-8-15. */


(function () {

    function ctrlEnums($scope, $rootScope, $state, api) {
        $scope.enums = []
        $scope.item = {}

        $scope.getEnums = function () {
            for (var i = 0; i < $rootScope.enum_types.length; i += 1) {
                $scope.getEnumByType(i)
            }
        }
        $scope.getEnumByType = function (index) {
            api.getEnumsByType($rootScope.enum_types[index].value)
                .success(function (data) {
                    $scope.enums[index] = data.val || {}
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
    }

    angular.module('app').controller('ctrlEnums', ctrlEnums)

})()

