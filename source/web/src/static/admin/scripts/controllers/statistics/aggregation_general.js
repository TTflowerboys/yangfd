(function () {

    function ctrlStatistics_aggregation_general($scope, fctModal, api, $stateParams) {

        $scope.get_aggregate_data = function () {
            if ($scope.selected.date_from && $scope.selected.date_to) {
                api.get_general($scope.selected.date_from, $scope.selected.date_to).success(on_refresh)
            }
        }
        function on_refresh(data) {
          $scope.value = data.val
          $scope.list = data.val.aggregation_user_type
        }
    }

    angular.module('app').controller('ctrlStatistics_aggregation_general', ctrlStatistics_aggregation_general)

})()
