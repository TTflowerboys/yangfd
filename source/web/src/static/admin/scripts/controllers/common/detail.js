/* Created by frank on 14-8-15. */


(function () {

    function ctrlDetail($scope, $state, $http, $rootScope, api, $stateParams, misc) {
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

    angular.module('app').controller('ctrlDetail', ctrlDetail)

})()

