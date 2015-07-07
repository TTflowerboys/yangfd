/* Created by frank on 14-8-14. */


(function () {

    function ctrlSignIn($scope, $state, $http, $rootScope, userApi, $stateParams, growl, errors) {
        $scope.user = {}
        $scope.submitDisabled = true

        $scope.submit = function ($event, form) {
            $event.preventDefault()
            $scope.submitted = true
            if (form.$invalid) {
                return
            }
            $scope.submitDisabled = true
            userApi.signIn($scope.user)
                .success(function (data, status, headers, config) {

                    if (_.isEmpty(data.val.role)) {
                        growl.addErrorMessage($rootScope.renderHtml(errors[40105]), {enableHtml: true})
                        $http.get('/logout', {errorMessage: true})
                        return
                    }
                    window._user = data.val

                    angular.extend($scope.user, data.val)
                    $state.go($stateParams.from || 'dashboard')
                })['finally'](function () {
                    $scope.submitDisabled = false
                })

        }


        $scope.onChangeText = function () {
            $scope.submitDisabled = false;
        }

        $scope.$watch('user.country', function () {
            $scope.onChangeText();
        })
    }

    angular.module('app').controller('ctrlSignIn', ctrlSignIn)

})()
