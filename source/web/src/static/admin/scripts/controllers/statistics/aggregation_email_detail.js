(function () {

    function ctrlStatistics_aggregation_email_detail($scope, fctModal, api, $stateParams) {

      $scope.get_aggregate_data = function () {
          if ($scope.selected.date_from && $scope.selected.date_to && ($scope.selected.date_from < $scope.selected.date_to)) {
            var date_start = new Date($scope.selected.date_from*1000)
            var date_end = new Date($scope.selected.date_to*1000)
            if (date_start.getFullYear() !== date_end.getFullYear()) {
              for (var year=date_start.getFullYear(); year < date_end.getFullYear(); year++) {
                var temp_date = new Date(date_end)
                temp_date.setFullYear(year + 1)
                api.get_email_detail(date_start.getTime()/1000, temp_date.getTime()/1000).success(on_refresh)
              }
            }
            else if (date_start.getMonth() !== date_end.getMonth()) {
            }
            else if (date_start.getDate() !== date_end.getDate()) {

            }
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
