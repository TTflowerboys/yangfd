(function () {

    function ctrlStatistics_aggregation_rent_request($scope, fctModal, api, $stateParams) {

      $scope.get_aggregate_data = function () {
          if ($scope.selected.date_from && $scope.selected.date_to) {
              api.get_rent_request($scope.selected.date_from, $scope.selected.date_to).success(on_refresh)
          }
      }
      function on_refresh(data) {
        $scope.value = data.val
        $scope.place_holder = '无'
        $scope.value.aggregation_rent_request_period_count_result = []
        for (var index = 0; index < $scope.value.aggregation_rent_request_period_count.length; index++) {
          for(var detail_index = 0; detail_index < $scope.value.aggregation_rent_request_period_count[index].detail.length; detail_index++) {
            var single_data = {}
            single_data = {
              'type': $scope.value.aggregation_rent_request_period_count[index].detail[detail_index].type,
              'count': $scope.value.aggregation_rent_request_period_count[index].detail[detail_index].count
            }
            if (detail_index === 0) {
              single_data.period = $scope.value.aggregation_rent_request_period_count[index].period
              single_data.total = $scope.value.aggregation_rent_request_period_count[index].detail.length
            }
            $scope.value.aggregation_rent_request_period_count_result = $scope.value.aggregation_rent_request_period_count_result.concat(single_data)
          }
        }
        window.console.log($scope.value.aggregation_rent_request_period_count_result)
      }

    }
    angular.module('app').controller('ctrlStatistics_aggregation_rent_request', ctrlStatistics_aggregation_rent_request)

})()
