/* Created by frank on 14-8-14. */


(function () {

    function ctrlSignIn($scope, $state, $http, $rootScope, userApi, $stateParams, countries, defaultCountry) {
        $scope.countries = countries
        $scope.user = {}
        $scope.user.country = defaultCountry

        $scope.submit = function ($event, form) {
            $event.preventDefault()
            if (form.$invalid) {
                return
            }

            userApi.signIn($scope.user)
                .success(function (data, status, headers, config) {
                    $state.go($stateParams.from || 'dashboard')
                })
                .error(function (data, status, headers, config) {
                    throw 'not done'
                })

        }
    }

    angular.module('app').controller('ctrlSignIn', ctrlSignIn)

})()
