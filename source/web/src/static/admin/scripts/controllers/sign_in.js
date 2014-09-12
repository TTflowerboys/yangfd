/* Created by frank on 14-8-14. */


(function () {

    function ctrlSignIn($scope, $state, $http, $rootScope, userApi, $stateParams) {
        $scope.user = {}
        $scope.submitDisabled = true

        $scope.submit = function ($event, form) {
            $event.preventDefault()
            $scope.submitted = true
            if (form.$invalid) {
                return
            }
            $scope.submitDisabled = true;
            userApi.signIn($scope.user)
                .success(function (data, status, headers, config) {
                    $state.go($stateParams.from || 'dashboard')
                })
        }

        $scope.onChangeText = function () {
            $scope.submitDisabled = false;
        }
    }

    angular.module('app').controller('ctrlSignIn', ctrlSignIn)

})()
