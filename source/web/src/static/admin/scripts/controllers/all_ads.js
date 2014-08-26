/* Created by frank on 14-8-25. */

(function () {

    function ctrlAllAds($scope, $state) {

        $scope.channels = $scope.$parent.channels
        $scope.refreshChannels = $scope.$parent.refreshChannels

    }

    angular.module('app').controller('ctrlAllAds', ctrlAllAds)

})()
