/* Created by frank on 14-8-14. */


(function () {

    function ctrlDashboard($scope, $state, $http, userApi) {

        $scope.user = {}

        userApi.checkLogin()
            .then(function (user) {
                angular.extend($scope.user, user)
            }, function () {
                $state.go('signIn')
            })

        if (team.getQuery('_i18n') !== $scope.dashboardLanguage.value) {
            location.href = team.setQuery('_i18n', $scope.dashboardLanguage.value)
        }

        $scope.logout = function () {
            $http.get('/logout', {errorMessage: true})
                .success(function () {
                    $state.go('signIn')
                })
        }
        $scope.changeLanguage = function () {
            if ($scope.dashboardLanguage.value) {
                location.href = team.setQuery('_i18n', $scope.dashboardLanguage.value)
            }
        }
    }

    angular.module('app').controller('ctrlDashboard', ctrlDashboard)

})()

