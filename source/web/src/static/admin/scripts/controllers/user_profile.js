/**
 * Created by chaowang on 9/23/14.
 */
(function () {

    function ctrlUserProfile($scope, $location , api, $stateParams, misc) {
        $scope.api = api
        $scope.tabName = 'favs'

        //Get User Profile Infomation
        var itemFromParent = misc.findById($scope.$parent.list, $stateParams.id)
        if (itemFromParent) {
            $scope.item = itemFromParent
        } else {
            api.getOne($stateParams.id)
                .success(function (data) {
                    $scope.item = data.val
                })
        }

        $scope.changeTab = function (tabName) {
            $scope.tabName = tabName
        }
    }

    angular.module('app').controller('ctrlUserProfile', ctrlUserProfile)

})()

