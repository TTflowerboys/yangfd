(function () {

    function user_portrait_landlord($scope, fctModal, api, $stateParams) {

      $scope.get_portrait_data = function () {
          if ($scope.selected.date_from && $scope.selected.date_to) {
              api.get_users_portrait_landlord($scope.selected.date_from, $scope.selected.date_to).success(on_refresh)
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

        detail_data.rent_ticket_renting_count_distribution = []
        detail_data.rent_ticket_renting_type_distribution = []
        detail_data.rent_ticket_renting_landlordtype_distribution = []
        detail_data.rent_ticket_renting_price_distribution = []

        detail_data.rent_ticket_renting_time_length_plan_distribution = []
        detail_data.rent_ticket_renting_time_length_ahead_distribution = []
        detail_data.rent_ticket_renting_page_view_times_distribution = []
        detail_data.rent_ticket_renting_wechat_share_times_distribution = []

        detail_data.rent_ticket_renting_favorite_times_distribution = []
        detail_data.rent_ticket_renting_requested_times_distribution = []
        detail_data.rent_ticket_renting_refresh_times_distribution = []

        detail_data.rent_ticket_renting_location_city = []
        detail_data.rent_ticket_renting_location_neighborhood = []
        detail_data.rent_ticket_renting_location_university = []
        detail_data.rent_ticket_renting_location_metro = []

        var value
        var index = 0
        var xaxis = {
          'rent_ticket_renting_location_city': [],
          'rent_ticket_renting_location_neighborhood': [],
          'rent_ticket_renting_location_university': [],
          'rent_ticket_renting_location_metro': [],
        }

        var temp_value = []
        for (var single in data.val.rent_ticket_renting_location_city) {
          temp_value.push({'label': single, 'value': data.val.rent_ticket_renting_location_city[single]})
        }
        temp_value.sort(compare_value).reverse()
        for (var single in temp_value) {
          detail_data.rent_ticket_renting_location_city.push([single, temp_value[single].value])
          xaxis.rent_ticket_renting_location_city.push([single, temp_value[single].label])
        }

        // index = 0
        // for (value in data.val.rent_ticket_renting_location_city) {
        //   detail_data.rent_ticket_renting_location_city.push([index, data.val.rent_ticket_renting_location_city[value]])
        //   xaxis.rent_ticket_renting_location_city.push([index, value])
        //   index += 1
        // }

        $.plot($('#rent_ticket_renting_location_city'),
          [
            {
              data: detail_data.rent_ticket_renting_location_city,
              color: '#FA5833',
              label:'days',
              bars: {show: true, align:'center', barWidth:0.75}
            }
          ],
          {
            xaxis: { ticks: xaxis.rent_ticket_renting_location_city}
          }
        );

        temp_value = []
        for (var single in data.val.rent_ticket_renting_location_neighborhood) {
          temp_value.push({'label': single, 'value': data.val.rent_ticket_renting_location_neighborhood[single]})
        }
        temp_value.sort(compare_value).reverse()
        for (var single in temp_value) {
          detail_data.rent_ticket_renting_location_neighborhood.push([single, temp_value[single].value])
          xaxis.rent_ticket_renting_location_neighborhood.push([single, temp_value[single].label])
        }

        // index = 0
        // for (value in data.val.rent_ticket_renting_location_neighborhood) {
        //   detail_data.rent_ticket_renting_location_neighborhood.push([index, data.val.rent_ticket_renting_location_neighborhood[value]])
        //   xaxis.rent_ticket_renting_location_neighborhood.push([index, value])
        //   index += 1
        // }

        $.plot($('#rent_ticket_renting_location_neighborhood'),
          [
            {
              data: detail_data.rent_ticket_renting_location_neighborhood,
              color: '#FA5833',
              label:'days',
              bars: {show: true, align:'center', barWidth:0.75}
            }
          ],
          {
            xaxis: { ticks: xaxis.rent_ticket_renting_location_neighborhood}
          }
        );

        temp_value = []
        for (var single in data.val.rent_ticket_renting_location_university) {
          temp_value.push({'label': single, 'value': data.val.rent_ticket_renting_location_university[single]})
        }
        temp_value.sort(compare_value).reverse()
        for (var single in temp_value) {
          detail_data.rent_ticket_renting_location_university.push([single, temp_value[single].value])
          xaxis.rent_ticket_renting_location_university.push([single, temp_value[single].label])
        }

        // index = 0
        // for (value in data.val.rent_ticket_renting_location_university) {
        //   detail_data.rent_ticket_renting_location_university.push([index, data.val.rent_ticket_renting_location_university[value]])
        //   xaxis.rent_ticket_renting_location_university.push([index, value])
        //   index += 1
        // }

        $.plot($('#rent_ticket_renting_location_university'),
          [
            {
              data: detail_data.rent_ticket_renting_location_university,
              color: '#FA5833',
              label:'days',
              bars: {show: true, align:'center', barWidth:0.75}
            }
          ],
          {
            xaxis: { ticks: xaxis.rent_ticket_renting_location_university}
          }
        );

        temp_value = []
        for (var single in data.val.rent_ticket_renting_location_metro) {
          temp_value.push({'label': single, 'value': data.val.rent_ticket_renting_location_metro[single]})
        }
        temp_value.sort(compare_value).reverse()
        for (var single in temp_value) {
          detail_data.rent_ticket_renting_location_metro.push([single, temp_value[single].value])
          xaxis.rent_ticket_renting_location_metro.push([single, temp_value[single].label])
        }

        // index = 0
        // for (value in data.val.rent_ticket_renting_location_metro) {
        //   detail_data.rent_ticket_renting_location_metro.push([index, data.val.rent_ticket_renting_location_metro[value]])
        //   xaxis.rent_ticket_renting_location_metro.push([index, value])
        //   index += 1
        // }

        $.plot($('#rent_ticket_renting_location_metro'),
          [
            {
              data: detail_data.rent_ticket_renting_location_metro,
              color: '#FA5833',
              label:'days',
              bars: {show: true, align:'center', barWidth:0.75}
            }
          ],
          {
            xaxis: { ticks: xaxis.rent_ticket_renting_location_metro}
          }
        );



        for (value in data.val.rent_ticket_renting_count_distribution) {
          detail_data.rent_ticket_renting_count_distribution.push({
            'label': value,
            'data': data.val.rent_ticket_renting_count_distribution[value]
          })
        }

        $.plot($('#rent_ticket_renting_count_distribution'),
          detail_data.rent_ticket_renting_count_distribution, {
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

        for (value in data.val.rent_ticket_renting_type_distribution) {
          detail_data.rent_ticket_renting_type_distribution.push({
            'label': value,
            'data': data.val.rent_ticket_renting_type_distribution[value]
          })
        }

        $.plot($('#rent_ticket_renting_type_distribution'),
          detail_data.rent_ticket_renting_type_distribution, {
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

        for (value in data.val.rent_ticket_renting_landlordtype_distribution) {
          detail_data.rent_ticket_renting_landlordtype_distribution.push({
            'label': value,
            'data': data.val.rent_ticket_renting_landlordtype_distribution[value]
          })
        }

        $.plot($('#rent_ticket_renting_landlordtype_distribution'),
          detail_data.rent_ticket_renting_landlordtype_distribution, {
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

        for (value in data.val.rent_ticket_renting_price_distribution) {
          detail_data.rent_ticket_renting_price_distribution.push({
            'label': value,
            'data': data.val.rent_ticket_renting_price_distribution[value]
          })
        }

        $.plot($('#rent_ticket_renting_price_distribution'),
          detail_data.rent_ticket_renting_price_distribution, {
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


        for (value in data.val.rent_ticket_renting_time_length_ahead_distribution) {
          detail_data.rent_ticket_renting_time_length_ahead_distribution.push({
            'label': value,
            'data': data.val.rent_ticket_renting_time_length_ahead_distribution[value]
          })
        }

        $.plot($('#rent_ticket_renting_time_length_ahead_distribution'),
          detail_data.rent_ticket_renting_time_length_ahead_distribution, {
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

        for (value in data.val.rent_ticket_renting_time_length_plan_distribution) {
          detail_data.rent_ticket_renting_time_length_plan_distribution.push({
            'label': value,
            'data': data.val.rent_ticket_renting_time_length_plan_distribution[value]
          })
        }

        $.plot($('#rent_ticket_renting_time_length_plan_distribution'),
          detail_data.rent_ticket_renting_time_length_plan_distribution, {
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

        for (value in data.val.rent_ticket_renting_requested_times_distribution) {
          detail_data.rent_ticket_renting_requested_times_distribution.push({
            'label': value,
            'data': data.val.rent_ticket_renting_requested_times_distribution[value]
          })
        }

        $.plot($('#rent_ticket_renting_requested_times_distribution'),
          detail_data.rent_ticket_renting_requested_times_distribution, {
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


        for (value in data.val.rent_ticket_renting_page_view_times_distribution) {
          detail_data.rent_ticket_renting_page_view_times_distribution.push({
            'label': value,
            'data': data.val.rent_ticket_renting_page_view_times_distribution[value]
          })
        }

        $.plot($('#rent_ticket_renting_page_view_times_distribution'),
          detail_data.rent_ticket_renting_page_view_times_distribution, {
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

        for (value in data.val.rent_ticket_renting_refresh_times_distribution) {
          detail_data.rent_ticket_renting_refresh_times_distribution.push({
            'label': value,
            'data': data.val.rent_ticket_renting_refresh_times_distribution[value]
          })
        }

        $.plot($('#rent_ticket_renting_refresh_times_distribution'),
          detail_data.rent_ticket_renting_refresh_times_distribution, {
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

        for (value in data.val.rent_ticket_renting_wechat_share_times_distribution) {
          detail_data.rent_ticket_renting_wechat_share_times_distribution.push({
            'label': value,
            'data': data.val.rent_ticket_renting_wechat_share_times_distribution[value]
          })
        }

        $.plot($('#rent_ticket_renting_wechat_share_times_distribution'),
          detail_data.rent_ticket_renting_wechat_share_times_distribution, {
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

        for (value in data.val.rent_ticket_renting_favorite_times_distribution) {
          detail_data.rent_ticket_renting_favorite_times_distribution.push({
            'label': value,
            'data': data.val.rent_ticket_renting_favorite_times_distribution[value]
          })
        }

        $.plot($('#rent_ticket_renting_favorite_times_distribution'),
          detail_data.rent_ticket_renting_favorite_times_distribution, {
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

    angular.module('app').controller('user_portrait_landlord', user_portrait_landlord)

})()
