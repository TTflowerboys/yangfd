(function () {

    function ctrlStatisticsOverview($scope, fctModal, api, $stateParams) {

        $scope.get_aggregate_data = function () {
            if ($scope.selected.date_from && $scope.selected.date_to) {
                api.get_general(date_from=$scope.selected.date_from, date_to=$scope.selected.date_to).success(on_refresh_general)
                api.get_rent_request(date_from=$scope.selected.date_from, date_to=$scope.selected.date_to).success(on_refresh_rent_request)
                api.get_rent_ticket(date_from=$scope.selected.date_from, date_to=$scope.selected.date_to).success(on_refresh_rent_ticket)
            }
        }

        function on_refresh_general(data) {
          $scope.register_user_total = data.val.aggregation_register_user_total
          $scope.user_type_list = data.val.aggregation_user_type
        }

        function on_refresh_rent_request(data) {
          $scope.rent_request_total = data.val.aggregation_rent_request_total_count
        }

        function on_refresh_rent_ticket(data) {
          $scope.rent_ticket_total = data.val.aggregation_rent_ticket_total
          $scope.rent_ticket_type = data.val.aggregation_rent_ticket_type
        }
    }

    angular.module('app').controller('ctrlStatisticsOverview', ctrlStatisticsOverview)

})()
