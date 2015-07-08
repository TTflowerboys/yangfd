/**
 * Created by chaowang on 10/03/14.
 */
(function () {

    function ctrlIntention($scope) {
        var intentionApi = $scope.$parent.api
        //Work around angular can not watch primitive type
        $scope.selected = {}
        $scope.selected.status = {}

        var params = {
            per_page: $scope.perPage
        }

        $scope.$watch('selected.status', function (newValue, oldValue) {
            // Ignore initial setup.
            if (newValue === oldValue) {
                return
            }

            params.status = $scope.selected.status
            intentionApi.getAll({ params: params, errorMessage: true }).success($scope.onGetList)
        }, true)
    }

    angular.module('app').controller('ctrlIntention', ctrlIntention)

})()

