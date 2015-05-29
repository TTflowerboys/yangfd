(function () {

    function ctrlRentDetail($scope, api, $stateParams, misc, $state) {
        $scope.api = api
        var itemFromParent = misc.findById($scope.$parent.list, $stateParams.id)

        if (itemFromParent) {
            $scope.item = itemFromParent
        } else {
            api.getOne($stateParams.id, {errorMessage: true})
                .success(function (data) {
                    $scope.item  = data.val
                })
        }
    }

    angular.module('app').controller('ctrlRentDetail', ctrlRentDetail)

})()

