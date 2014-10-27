/**
 * Created by Michael on 14/10/22.
 */
(function () {

    function ctrlPlotList($scope, api) {
        $scope.item = {}
        $scope.api = api
        $scope.fetched = false

        $scope.$watch('item.propertyId', function (newValue) {
            if (_.isEmpty(newValue)) {
                return
            }
            api.search({params: {property_id: newValue, _i18n: 'disabled'}}).success(onGetList)
        })

        $scope.onGetList = onGetList

        function onGetList(data) {
            $scope.fetched = true
            $scope.list = data.val

        }

    }

    angular.module('app').controller('ctrlPlotList', ctrlPlotList)

})()

