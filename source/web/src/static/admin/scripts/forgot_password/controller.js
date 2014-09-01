/* Created by frank on 14-8-14. */


(function () {

    function ctrlForgotPassword($scope, $timeout, $state, $http, $rootScope, userApi, $stateParams, growl) {
        $scope.user = {}
        var sendText = '发送'
        $scope.sendText = sendText
        $scope.sendDisabled = false
        $scope.submit = function ($event, form) {
            $event.preventDefault()
            $scope.submitted = true
            if (form.$invalid) {
                return
            }
            if ($scope.user.password !== $scope.user.checkPassword) {
                growl.addErrorMessage('2次输入的密码不一致')
                return
            }
            userApi.resetPassword($scope.user.id, $scope.user.code, $scope.user.password)
                .success(function (data, status, headers, config) {
                    $state.go($stateParams.from || 'dashboard')
                })

        }

        $scope.sendVerification = function () {
            userApi.sendVerification($scope.user)
                .success(function (data, status, headers, config) {
                    $scope.user.id = data.val
                })
                .error(function (data, status, headers, config) {
                    $scope.sendText = sendText
                    $scope.sendDisabled = false
                })
            if ($scope.sendText === sendText) {
                $scope.sendText = 60
                $scope.sendDisabled = true
                $timeout($scope.onTimeout, 1000)
            }
        }

        $scope.onTimeout = function () {

            if (!angular.isNumber($scope.sendText)) {
                return
            }
            $scope.sendText -= 1

            if ($scope.sendText <= 0) {
                $scope.sendText = sendText
                $scope.sendDisabled = false
                return
            }
            $timeout($scope.onTimeout, 1000)
        }

    }

    angular.module('app').controller('ctrlForgotPassword', ctrlForgotPassword)

})()
