/* Created by frank on 14-8-14. */


(function () {

    function ctrlDashboard($scope, $state, $http, userApi, misc, $rootScope) {

        $scope.user = {}

        userApi.checkLogin()
            .then(function (user) {
                angular.extend($scope.user, user)
            }, function () {
                $state.go('signIn')
            })

        $scope.logout = function () {
            $http.get('/logout', {errorMessage: true})
                .success(function () {
                    $state.go('signIn')
                })
        }
    }

    angular.module('app').controller('ctrlDashboard', ctrlDashboard)

})()

