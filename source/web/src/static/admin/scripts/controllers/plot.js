/**
 * Created by Michael on 14/10/22.
 */
(function () {

    function ctrlPlotList($scope, api) {
        $scope.item = {}
        $scope.api = api
        $scope.fetched = false

        $scope.onPropertyChange = function () {
            api.search({ params: {property_id: $scope.item.propertyId}}).success(onGetList)
        }

        $scope.onGetList = onGetList

        function onGetList(data) {
            $scope.fetched = true
            $scope.list = data.val

        }

    }

    angular.module('app').controller('ctrlPlotList', ctrlPlotList)

})()

