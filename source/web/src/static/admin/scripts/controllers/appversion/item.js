(function () {

    function ctrlAppversionItems($scope, $rootScope, apiFactory) {

        $scope.addChangeLog = function () {
            /*if (_.isEmpty($scope.item.changelog)) {
                $scope.item.changelog = {}
            }*/
            if (!$scope.item.changelog) {
                $scope.item.changelog = []
            }
            $scope.item.changelog.push('')
        }


        $scope.onRemoveChangeLog = function (index) {
            $scope.item.changelog.splice(index, 1)
        }


    }

    angular.module('app').controller('ctrlAppversionItems', ctrlAppversionItems)

})()