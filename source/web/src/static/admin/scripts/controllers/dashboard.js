/* Created by frank on 14-8-14. */


(function () {

    function ctrlDashboard($scope, $state, $http, userApi, $rootScope, growl, errors) {

        $scope.user = {}

        userApi.checkLogin()
            .then(function (user) {
                if (_.isEmpty(user.role)) {
                    growl.addErrorMessage($rootScope.renderHtml(errors[40105]), {enableHtml: true})
                    window.location.href = '/'
                    return
                }
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

        //Shop id that used for crowdfunding
        $scope.shopId = '54a3c92b6b809945b0d996bf'
        //shopApi.getAll().success(function (data) {
        //    var list = data.val
        //    if (list.length === 1) {
        //        $scope.shopId = list[0].id
        //    }
        //})
    }

    angular.module('app').controller('ctrlDashboard', ctrlDashboard)

})()

