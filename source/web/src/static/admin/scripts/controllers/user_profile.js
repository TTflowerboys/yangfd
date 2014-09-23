/**
 * Created by chaowang on 9/23/14.
 */
(function () {

    function ctrlUserProfile($scope, $state, $http, $rootScope, api, $stateParams, misc) {
        $scope.api = api

        var itemFromParent = misc.findById($scope.$parent.list, $stateParams.id)

        if (itemFromParent) {
            $scope.item = itemFromParent
        } else {
            api.getOne($stateParams.id)
                .success(function (data) {
                    $scope.item = data.val
                })
        }
    }

    angular.module('app').controller('ctrlUserProfile', ctrlUserProfile)

})()

