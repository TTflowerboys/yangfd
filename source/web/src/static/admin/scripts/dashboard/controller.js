/* Created by frank on 14-8-14. */


(function () {

    function ctrlDashboard($scope, $state, $http, userApi, adApi, misc, $rootScope) {

        $scope.user = {}

        userApi.checkLogin()
            .then(function (data) {
                angular.extend($scope.user, data.val)
            })

        $scope.channels = []

        $scope.refreshChannels = function () {
            adApi.getChannels()
                .then(function (xhr) {
                    misc.resetArray($scope.channels, xhr.data.val)
                })
        }

        $scope.refreshChannels()


        var canceler = $scope.$on('$stateChangeSuccess', function () {
            $scope.customizeOpen = $state.includes('dashboard.allAds') || $state.includes('dashboard.ad') || $state.includes('dashboard.ad.*')
        })

        $scope.$on('$destroy', function () {
            canceler()
        })


    }

    angular.module('app').controller('ctrlDashboard', ctrlDashboard)

})()

