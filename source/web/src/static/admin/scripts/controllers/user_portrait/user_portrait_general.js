(function () {

    function user_portrait_general($scope, fctModal, api, $stateParams) {

      $scope.get_portrait_data = function () {
          if ($scope.selected.date_from && $scope.selected.date_to) {
              api.get_users_portrait_general($scope.selected.date_from, $scope.selected.date_to).success(on_refresh)
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
        detail_data.country = []
        detail_data.user_type = []
        detail_data.occupation = []
        detail_data.gender = []
        detail_data.active_days = []
        detail_data.age = []
        detail_data.device = []

        var index = 0
        var xaxis = {
          'age': [],
          'country': []
        }

        var temp_value = []

        temp_value = []
        for (var single in data.val.user_portrait_country_distribution) {
          temp_value.push({'label': single, 'value': data.val.user_portrait_country_distribution[single]})
        }
        temp_value.sort(compare_value).reverse()
        for (var single in temp_value) {
          detail_data.country.push([single, temp_value[single].value])
          xaxis.country.push([single, temp_value[single].label])
        }

        $.plot($('#user_portrait_country_distribution'),
          [
            {
              data: detail_data.country,
              color: '#FA5833',
              label:'人数',
              bars: {show: true, align:'center', barWidth:0.75}
            }
          ],
          {
            xaxis: { ticks: xaxis.country}
          }
        );

        temp_value = []
        for (var single in data.val.user_portrait_age_distribution) {
          temp_value.push({'label': single, 'value': data.val.user_portrait_age_distribution[single]})
        }
        temp_value.sort(compare_value).reverse()
        for (var single in temp_value) {
          detail_data.age.push([single, temp_value[single].value])
          xaxis.age.push([single, temp_value[single].label])
        }

        // index = 0
        // for (value in data.val.user_portrait_age_distribution) {
        //   detail_data.age.push([index, data.val.user_portrait_age_distribution[value]])
        //   xaxis.age.push([index, value])
        //   index += 1
        // }

        $.plot($('#user_portrait_age_distribution'),
          [
            {
              data: detail_data.age,
              color: '#2FABE9',
              label:'age',
              bars: {show: true, align:'center', barWidth:0.75}
            }
          ],
          {
            xaxis: { ticks: xaxis.age}
          }
        );

        for (value in data.val.user_portrait_user_type) {
          detail_data.user_type.push({
            'label': value,
            'data': data.val.user_portrait_user_type[value]
          })
        }

        $.plot($('#user_portrait_user_type'),
          detail_data.user_type, {
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

        for (value in data.val.user_portrait_occupation_distribution) {
          detail_data.occupation.push({
            'label': value,
            'data': data.val.user_portrait_occupation_distribution[value]
          })
        }

        $.plot($('#user_portrait_occupation_distribution'),
          detail_data.occupation, {
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

        for (value in data.val.user_portrait_gender_type) {
          detail_data.gender.push({
            'label': value,
            'data': data.val.user_portrait_gender_type[value]
          })
        }

        $.plot($('#user_portrait_gender'),
          detail_data.gender, {
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

        for (value in data.val.user_portrait_active_days) {
          detail_data.active_days.push({
            'label': value,
            'data': data.val.user_portrait_active_days[value]
          })
        }

        $.plot($('#user_portrait_active_days'),
          detail_data.active_days, {
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

        for (value in data.val.user_portrait_user_device) {
          detail_data.device.push({
            'label': value,
            'data': data.val.user_portrait_user_device[value]
          })
        }

        $.plot($('#user_portrait_user_device'),
          detail_data.device, {
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

        window.console.log(detail_data)

      }

    }

    angular.module('app').controller('user_portrait_general', user_portrait_general)

})()
