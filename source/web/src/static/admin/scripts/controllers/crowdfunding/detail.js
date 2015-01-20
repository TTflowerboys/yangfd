/**
 * Created by zhou on 15-1-13.
 */


(function () {

    function ctrlCrowdfundingDetail($scope, api, $stateParams, misc, $state) {
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
        $scope.submitForAccept = function () {
            api.update({status: 'new', id: $stateParams.id}, {
                successMessage: 'Update successfully',
                errorMessage: 'Update failed'
            }).success(function (data) {
                $state.go('^')
            })['finally'](function () {
                $scope.loading = false
            })
        }

        $scope.submitForReject = function () {
            api.update({status: 'rejected', id: $stateParams.id}, {
                successMessage: 'Update successfully',
                errorMessage: 'Update failed'
            }).success(function (data) {
                $state.go('^')
            })['finally'](function () {
                $scope.loading = false
            })
        }
    }

    angular.module('app').controller('ctrlCrowdfundingDetail', ctrlCrowdfundingDetail)

})()

