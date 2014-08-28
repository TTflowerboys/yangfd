/* Created by frank on 14-8-14. */


(function () {

    function ctrlDashboard($scope, $state, $http, userApi, misc, $rootScope) {

        $scope.user = {}

        userApi.checkLogin()
            .then(function (data) {
                angular.extend($scope.user, data.val)
            }, function () {
                $state.go('signIn', {from: $state.current.name})
            })
    }

    angular.module('app').controller('ctrlDashboard', ctrlDashboard)

})()

