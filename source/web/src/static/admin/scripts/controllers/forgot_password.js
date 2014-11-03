/* Created by frank on 14-8-14. */


(function () {

    function ctrlForgotPassword($scope, $timeout, $state, userApi, $stateParams) {
        $scope.user = {}
        var sendText = '发送验证码至手机'
        var resendText = '重新发送'
        var countdownText = '秒后' + resendText
        $scope.sendText = sendText
        $scope.countdown = 0
        $scope.submit = function ($event, form) {
            $event.preventDefault()
            $scope.submitted = true
            if (form.$invalid) {
                return
            }
            userApi.resetPassword($scope.user.id, $scope.user.code, $scope.user.password)
                .success(function (data, status, headers, config) {
                    $state.go($stateParams.from || 'dashboard')
                })

        }

        $scope.sendVerification = function ($event, form) {
            $event.preventDefault()
            $scope.isSend = true
            if (form.$invalid) {
                return
            }
            userApi.sendVerification($scope.user)
                .success(function (data, status, headers, config) {
                    $scope.user.id = data.val
                    $scope.countdown = 60
                    $scope.sendText = $scope.countdown + countdownText
                    $timeout($scope.onTimeout, 1000)
                })
                .error(function (data, status, headers, config) {
                    $scope.sendText = sendText
                    $scope.countdown = 0
                })
        }

        $scope.onTimeout = function () {
            if ($scope.countdown <= 0) {
                return
            }
            $scope.countdown -= 1

            if ($scope.countdown > 0) {
                $scope.sendText = $scope.countdown + countdownText
            } else {
                $scope.sendText = resendText
                return
            }
            $timeout($scope.onTimeout, 1000)
        }

        $scope.onChangePhone = function () {
            if ($scope.sendText === sendText) {
                return
            }
            $scope.sendText = sendText
            $scope.countdown = 0
        }
    }

    angular.module('app').controller('ctrlForgotPassword', ctrlForgotPassword)

})()
