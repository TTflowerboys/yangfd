/**
 * Created by chaowang on 9/23/14.
 */
(function () {

    function ctrlUserProfile($scope, $state, api, misc) {
        $scope.api = api

        if ($state.current.url === '/:id') {
            // Refer to favs if someone enter url to access
            $state.go('.favs')
        }


        //Get User Profile Information
        var itemFromParent = misc.findById($scope.$parent.list, $state.params.id)
        if (itemFromParent) {
            $scope.item = itemFromParent
        } else {
            api.getOne($state.params.id, { errorMessage: true})
                .success(function (data) {
                    $scope.item = data.val
                })
        }

    }

    angular.module('app').controller('ctrlUserProfile', ctrlUserProfile)

})()

