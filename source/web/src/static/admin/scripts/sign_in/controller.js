/* Created by frank on 14-8-14. */


(function () {

    function ctrlSignIn($scope, $state, $http, $rootScope, userApi, $stateParams) {
        $scope.countries=[{name:'中国',value:'CN'},{name:'英国',value:'UK'},{name:'香港',value:'HK'},{name:'美国',value:'US'}]
        $scope.user={}
        $scope.user.country=$rootScope.defaultCountry

        $scope.submit = function ($event, form) {
            $event.preventDefault()
            if (form.$invalid) {
                return
            }

            userApi.signIn($scope.user.country,$scope.user.phone, $scope.user.password)
                .success(function (data, status, headers, config) {
                    $state.go($stateParams.from || 'dashboard')
                })

        }
    }

    angular.module('app').controller('ctrlSignIn', ctrlSignIn)

})()
