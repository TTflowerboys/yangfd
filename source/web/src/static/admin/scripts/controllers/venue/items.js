(function () {

    function ctrlVenueItems($scope, $rootScope, apiFactory) {


        $scope.updateStatus = function (item) {
            apiFactory('venue').update({id: item.id, status: item.status}).success(function () {
                $scope.refreshList()
            })
        }

    }

    angular.module('app').controller('ctrlVenueItems', ctrlVenueItems)

})()