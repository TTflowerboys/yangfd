/* Created by frank on 14-8-14. */


(function () {

    function ctrlForgotPassword($scope, $timeout, $state, $http, $rootScope, userApi, $stateParams, countries, defaultCountry) {
        $scope.countries = countries
        $scope.user = {}
        $scope.user.country = defaultCountry
        sendText = '发送'
        $scope.send = sendText
        $scope.sendable = false
        $scope.submit = function ($event, form) {
            $event.preventDefault()
            if (form.$invalid) {
                return
            }

            userApi.smsResetPassword($scope.user.id, $scope.user.code, $scope.user.password)
                .success(function (data, status, headers, config) {
                    $state.go($stateParams.from || 'dashboard')
                })

        }

        $scope.sendVerification = function () {
            userApi.smsVerificationSend($scope.user.country, $scope.user.phone)
                .success(function (data, status, headers, config) {
                    $scope.user.id = $data.val
                })
            $scope.onTimeout = function () {
                $scope.send--;
                if ($scope.send <= 0) {
                    $scope.send = sendText
                    $scope.sendable = false;
                    return
                }
                $timeout($scope.onTimeout, 1000);
            }
            if ($scope.send == sendText) {
                $scope.send = 60;
                $scope.sendable = true;
                $timeout($scope.onTimeout, 1000);
            }
        }
    }

    angular.module('app').controller('ctrlForgotPassword', ctrlForgotPassword)

})()
