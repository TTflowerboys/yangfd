(function () {

    function user_portrait_tenants($scope, fctModal, api, $stateParams) {

      $scope.get_portrait_data = function () {
          if ($scope.selected.date_from && $scope.selected.date_to) {
              api.get_users_portrait_tenants($scope.selected.date_from, $scope.selected.date_to).success(on_refresh)
          }
      }
      function on_refresh(data) {
        function compare_value(a, b) {
          if (a.value > b.value) {
            return 1;
          }
          if (a.value < b.value) {
            return -1;
          }
          return 0;
        }
        $scope.value = data.val
        $scope.place_holder = '无'

        var detail_data = {}
        detail_data.finding_rent_days_distribution = []
        detail_data.tenant_count = []
        detail_data.ticket_access_time = []
        detail_data.ticket_favorite_time = []
        detail_data.ticket_request_time = []
        detail_data.want_rent_days_distribution = []

        var value
        var index = 0
        var xaxis = {
          'finding_rent_days_distribution': [],
          'want_rent_days_distribution': []
        }

        var temp_value = []
        for (var single in data.val.finding_rent_days_distribution) {
          temp_value.push({'label': single, 'value': data.val.finding_rent_days_distribution[single]})
        }
        temp_value.sort(compare_value).reverse()
        for (var single in temp_value) {
          detail_data.finding_rent_days_distribution.push([single, temp_value[single].value])
          xaxis.finding_rent_days_distribution.push([single, temp_value[single].label])
        }

        // for (value in data.val.finding_rent_days_distribution) {
        //   detail_data.finding_rent_days_distribution.push([index, data.val.finding_rent_days_distribution[value]])
        //   xaxis.finding_rent_days_distribution.push([index, value])
        //   index += 1
        // }

        $.plot($('#user_portrait_tenants_finding_rent_days_distribution'),
          [
            {
              data: detail_data.finding_rent_days_distribution,
              color: '#FA5833',
              label:'days',
              bars: {show: true, align:'center', barWidth:0.75}
            }
          ],
          {
            xaxis: { ticks: xaxis.finding_rent_days_distribution}
          }
        );

        temp_value = []
        for (var single in data.val.want_rent_days_distribution) {
          temp_value.push({'label': single, 'value': data.val.want_rent_days_distribution[single]})
        }
        temp_value.sort(compare_value).reverse()
        for (var single in temp_value) {
          detail_data.want_rent_days_distribution.push([single, temp_value[single].value])
          xaxis.want_rent_days_distribution.push([single, temp_value[single].label])
        }

        // index = 0
        // for (value in data.val.want_rent_days_distribution) {
        //   detail_data.want_rent_days_distribution.push([index, data.val.want_rent_days_distribution[value]])
        //   xaxis.want_rent_days_distribution.push([index, value])
        //   index += 1
        // }

        $.plot($('#user_portrait_tenants_want_rent_days_distribution'),
          [
            {
              data: detail_data.want_rent_days_distribution,
              color: '#FA5833',
              label:'days',
              bars: {show: true, align:'center', barWidth:0.75}
            }
          ],
          {
            xaxis: { ticks: xaxis.want_rent_days_distribution}
          }
        );

        for (value in data.val.ticket_access_time) {
          detail_data.ticket_access_time.push({
            'label': value,
            'data': data.val.ticket_access_time[value]
          })
        }

        $.plot($('#user_portrait_tenants_ticket_access_time'),
          detail_data.ticket_access_time, {
          series: {
            pie: {
              innerRadius: 0.5,
              show: true
            }
          },
          legend: {
            show: false
          }
        });

        for (value in data.val.tenant_count) {
          detail_data.tenant_count.push({
            'label': value,
            'data': data.val.tenant_count[value]
          })
        }

        $.plot($('#user_portrait_tenants_tenant_count'),
          detail_data.tenant_count, {
          series: {
            pie: {
              innerRadius: 0.5,
              show: true
            }
          },
          legend: {
            show: false
          }
        });

        for (value in data.val.ticket_favorite_time) {
          detail_data.ticket_favorite_time.push({
            'label': value,
            'data': data.val.ticket_favorite_time[value]
          })
        }

        $.plot($('#user_portrait_tenants_ticket_favorite_time'),
          detail_data.ticket_favorite_time, {
          series: {
            pie: {
              innerRadius: 0.5,
              show: true
            }
          },
          legend: {
            show: false
          }
        });

        for (value in data.val.ticket_request_time) {
          detail_data.ticket_request_time.push({
            'label': value,
            'data': data.val.ticket_request_time[value]
          })
        }

        $.plot($('#user_portrait_tenants_ticket_request_time'),
          detail_data.ticket_request_time, {
          series: {
            pie: {
              innerRadius: 0.5,
              show: true
            }
          },
          legend: {
            show: false
          }
        });

      }

    }

    angular.module('app').controller('user_portrait_tenants', user_portrait_tenants)

})()
