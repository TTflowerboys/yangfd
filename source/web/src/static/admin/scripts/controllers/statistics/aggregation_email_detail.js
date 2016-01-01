(function () {

    function ctrlStatistics_aggregation_email_detail($scope, fctModal, api, $stateParams) {

      $scope.get_aggregate_data = function () {
          if ($scope.selected.date_from && $scope.selected.date_to) {
              api.get_email_detail($scope.selected.date_from, $scope.selected.date_to).success(on_refresh)
          }
      }
      function on_refresh(data) {
        function filter_params(p) {
          var result_list = []
          var result_dic = {}
          var event_order = [
            'total',
            'delivered',
            'delivered_ratio',
            'open',
            'open_ratio',
            'open_repeat',
            'click',
            'click_ratio',
            'click_repeat'
          ]
          for (var index = 0, len = event_order.length; index < len; index++) {
            result_dic = {}
            if (index === 0) {
              result_dic.total = len
            }
            result_dic.tag = p.tag
            result_dic.key = event_order[index]
            result_dic.value = p[event_order[index]]
            result_list.push(result_dic)
          }
          return result_list
        }
        $scope.value = data.val
        var temp = data.val.aggregation_email_tag_detail.slice()
        $scope.value.aggregation_email_tag_detail = []
        for (var index = 0, len = temp.length; index < len; index++) {
          $scope.value.aggregation_email_tag_detail = $scope.value.aggregation_email_tag_detail.concat(filter_params(temp[index]))
        }
        $scope.place_holder = '无'
      }
    }
    angular.module('app').controller('ctrlStatistics_aggregation_email_detail', ctrlStatistics_aggregation_email_detail)

})()
