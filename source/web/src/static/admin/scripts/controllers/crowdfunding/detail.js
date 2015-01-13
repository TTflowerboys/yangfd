/**
 * Created by zhou on 15-1-13.
 */


(function () {

    function ctrlCrowdfundingDetail($scope, api, $stateParams, misc) {
        $scope.api = api
        var itemFromParent = misc.findById($scope.$parent.list, $stateParams.id)

        if (itemFromParent) {
            $scope.item = itemFromParent
        } else {
            api.getOne($stateParams.shop_id, $stateParams.id)
                .success(function (data) {
                    $scope.item = data.val
                })
        }

    }

    angular.module('app').controller('ctrlCrowdfundingDetail', ctrlCrowdfundingDetail)

})()

