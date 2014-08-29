/* Created by frank on 14-8-14. */


(function () {

    function ctrlForgotPassword($scope, $timeout, $state, $http, $rootScope, userApi, $stateParams, countries, defaultCountry) {
        $scope.countries = countries
        $scope.user = {}
        $scope.user.country = defaultCountry
        var sendText = '发送'
        $scope.sendText = sendText
        $scope.sendDisabled = false
        $scope.submit = function ($event, form) {
            $event.preventDefault()
            if (form.$invalid) {
                return
            }

            userApi.resetPassword($scope.user.id, $scope.user.code, $scope.user.password)
                .success(function (data, status, headers, config) {
                    $state.go($stateParams.from || 'dashboard')
                })

        }

        $scope.sendVerification = function () {
            userApi.checkUserExist($scope.user).then(function () {
                userApi.smsVerificationSend($scope.user)
                    .success(function (data, status, headers, config) {
                        $scope.user.id = data.val
                    })
            }, function () {

            })
            $scope.onTimeout = function () {
                $scope.sendText -= 1;
                if ($scope.sendText <= 0) {
                    $scope.sendText = sendText
                    $scope.sendDisabled = false;
                    return
                }
                $timeout($scope.onTimeout, 1000);
            }
            if ($scope.sendText === sendText) {
                $scope.sendText = 60;
                $scope.sendDisabled = true;
                $timeout($scope.onTimeout, 1000);
            }
        }
    }

    angular.module('app').controller('ctrlForgotPassword', ctrlForgotPassword)

})()
