(function () {

    function ctrlVenueProfile($scope, $state, api, misc) {
        $scope.api = api

        if ($state.current.url === '/:id') {
            // Refer to favs if someone enter url to access
            $state.go('.deals')
        }


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

    angular.module('app').controller('ctrlVenueProfile', ctrlVenueProfile)

})()

