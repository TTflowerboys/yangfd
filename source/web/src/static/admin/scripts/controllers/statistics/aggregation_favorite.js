(function () {

    function ctrlStatistics_aggregation_favorite($scope, fctModal, api, $stateParams) {

      $scope.get_aggregate_data = function () {
          if ($scope.selected.date_from && $scope.selected.date_to) {
              api.get_favorite($scope.selected.date_from, $scope.selected.date_to).success(on_refresh)
          }
      }
      function on_refresh(data) {
        $scope.value = data.val
        $scope.place_holder = '无'
      }

    }
    angular.module('app').controller('ctrlStatistics_aggregation_favorite', ctrlStatistics_aggregation_favorite)

})()
