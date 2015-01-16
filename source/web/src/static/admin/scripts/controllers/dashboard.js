/* Created by frank on 14-8-14. */


(function () {

    function ctrlDashboard($scope, $state, $http, userApi, shopApi) {

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

        shopApi.getAll().success(function (data) {
            var list = data.val
            if (list.length === 1) {
                $scope.shopId = list[0].id
            }
        })
    }

    angular.module('app').controller('ctrlDashboard', ctrlDashboard)

})()

