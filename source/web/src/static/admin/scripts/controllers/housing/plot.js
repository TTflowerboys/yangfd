/**
 * Created by Michael on 14/11/10.
 */
(function () {

    function ctrlHousingPlot($scope, $stateParams, api) {
        $scope.item = {}
        $scope.api = api
        $scope.fetched = false

        api.search({params: {property_id: $stateParams.id, _i18n: 'disabled'}}).success(onGetList)

        $scope.onGetList = onGetList

        function onGetList(data) {
            $scope.fetched = true
            $scope.list = data.val

        }

    }

    angular.module('app').controller('ctrlHousingPlot', ctrlHousingPlot)

})()