/* Created by frank on 14-8-14. */


(function () {

    function ctrlSignUp($scope, $state, $http, $rootScope, userApi, $stateParams) {
        $scope.submit = function ($event, form) {
            alert('sign up')
            $event.preventDefault()
            if (form.$invalid) {
                return
            }

            userApi.signIn($scope.user.phone, $scope.user.password)
                .success(function (data, status, headers, config) {
                    $state.go($stateParams.from || 'dashboard')
                })

        }
    }

    angular.module('app').controller('ctrlSignUp', ctrlSignUp)

})()
