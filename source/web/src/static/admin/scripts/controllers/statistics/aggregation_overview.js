(function () {

    function ctrlStatisticsOverview($scope, fctModal, api, $stateParams) {

        $scope.get_aggregate_data = function () {
            if ($scope.selected.date_from && $scope.selected.date_to) {
                api.get_general($scope.selected.date_from, $scope.selected.date_to).success(on_refresh_general)
                api.get_rent_request($scope.selected.date_from, $scope.selected.date_to).success(on_refresh_rent_request)
                api.get_rent_ticket($scope.selected.date_from, $scope.selected.date_to).success(on_refresh_rent_ticket)
            }
        }

        function on_refresh_general(data) {
          $scope.register_user_total = data.val.aggregation_register_user_total
          $scope.user_type_list = data.val.aggregation_user_type
          $scope.place_holder = "无"
        }

        function on_refresh_rent_request(data) {
          $scope.rent_request_total = data.val.aggregation_rent_request_total_count
          $scope.place_holder = "无"
        }

        function on_refresh_rent_ticket(data) {
          $scope.rent_ticket_total = data.val.aggregation_rent_ticket_total
          $scope.rent_ticket_type = data.val.aggregation_rent_ticket_type
          $scope.place_holder = "无"
        }
    }

    angular.module('app').controller('ctrlStatisticsOverview', ctrlStatisticsOverview)

})()
