/* Created by frank on 14-8-14. */


(function () {

    function ctrlSignIn($scope, $state, $http, $rootScope, userApi, $stateParams) {
        $scope.submit = function ($event, form) {
            $event.preventDefault()
            if (form.$invalid) {
                return
            }

            userApi.signIn($scope.user.email, $scope.user.password)
                .success(function (data, status, headers, config) {
                    $state.go($stateParams.from || 'dashboard')
                })

        }
    }

    angular.module('app').controller('ctrlSignIn', ctrlSignIn)

})()
