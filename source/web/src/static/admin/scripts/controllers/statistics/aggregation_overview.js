(function () {

    function ctrlStatisticsOverview($scope, fctModal, api, $stateParams, $q) {

      $scope.get_aggregate_data = function () {

        if ($scope.selected.date_from && $scope.selected.date_to && ($scope.selected.date_from < $scope.selected.date_to)) {
          var date_start = new Date($scope.selected.date_from*1000)
          var date_end = new Date($scope.selected.date_to*1000)
          if ($scope.time_segment !== undefined) {
            var result = $scope.date_range_splite(date_start, date_end)
            // var temp_result = []
            // var data_list = []
            $q.all(_.map(result, function(date_temp, index){
              return $q.all(
                [
                  api.get_general(result[index].start.getTime(), result[index].end.getTime()),
                  api.get_rent_request(result[index].start.getTime(), result[index].end.getTime()),
                  api.get_rent_ticket(result[index].start.getTime(), result[index].end.getTime())
                ]
              )
              .then(function(value){
                return angular.extend(value[0].data.val,value[1].data.val,value[2].data.val, {'date': result[index]})
              })
            }))
            .then(function(value) {
              var resultfinal = {}
              resultfinal.user = []
              resultfinal.rent = []
              resultfinal.request = []
              _.map(value, function(item) {
                resultfinal.user.push(
                  {
                    'x': item.date.start,
                    'y': item.aggregation_register_user_total
                  }
                )
                resultfinal.rent.push(
                  {
                    'x': item.date.start,
                    'y': item.aggregation_rent_ticket_total
                  }
                )
                resultfinal.request.push(
                  {
                    'x': item.date.start,
                    'y': item.aggregation_rent_request_total_count
                  }
                )
              })
              return resultfinal
            })
            .then(function(resultfinal) {
              var tt = document.createElement('div')
              var leftOffset = -(parseInt($('html').css('padding-left').replace('px', '')) + parseInt($('body').css('margin-left').replace('px', '')))
              var topOffset = -32
              tt.className = 'ex-tooltip'
              document.body.appendChild(tt)
              var graph_data_user = {
                'xScale': 'time',
                'yScale': 'linear',
                'main': [
                  {
                    'className': '.pizza',
                    'data': resultfinal.user
                  }
                ]
              }
              var graph_data_rent = {
                'xScale': 'time',
                'yScale': 'linear',
                'main': [
                  {
                    'className': '.pizza',
                    'data': resultfinal.rent
                  }
                ]
              }
              var graph_data_request = {
                'xScale': 'time',
                'yScale': 'linear',
                'main': [
                  {
                    'className': '.pizza',
                    'data': resultfinal.request
                  }
                ]
              }
              var opts = {
                'dataFormatX': function (x) {
                  return x
                },
                'tickFormatX': function (x) {
                  return window.d3.time.format('%Y-%m-%d')(x)
                },
                'mouseover': function (d, i) {
                  var pos = $(this).offset();
                  $(tt).text(window.d3.time.format('%Y-%m-%d')(d.x) + ': ' + d.y)
                    .css({
                      'top': topOffset + pos.top,
                      'left': pos.left + leftOffset,
                      'z-index': 999
                    })
                    .show();
                },
                'mouseout': function (x) {
                  $(tt).hide();
                }
              }
              // $('#aggregation_user_type')
              $('#aggregation_register_user_total').css({'height': '200px'})
              $('#aggregation_rent_ticket_total').css({'height': '200px'})
              $('#aggregation_rent_request_total_count').css({'height': '200px'})
              var myChart_user
              var myChart_rent
              var myChart_request
              myChart_user = new window.xChart('line-dotted', graph_data_user, '#aggregation_register_user_total', opts)
              myChart_rent = new window.xChart('line-dotted', graph_data_rent, '#aggregation_rent_ticket_total', opts)
              myChart_request = new window.xChart('line-dotted', graph_data_request, '#aggregation_rent_request_total_count', opts)
            })

          }
          $q.all(
            [
              api.get_general($scope.selected.date_from, $scope.selected.date_to),
              api.get_rent_request($scope.selected.date_from, $scope.selected.date_to),
              api.get_rent_ticket($scope.selected.date_from, $scope.selected.date_to)
            ]
          )
          .then(function (value) {
            return angular.extend(value[0].data.val, value[1].data.val, value[2].data.val)
          })
          .then(function(value) {
            $scope.place_holder = '无'
            $scope.register_user_total = value.aggregation_register_user_total
            $scope.user_type_list = value.aggregation_user_type
            $scope.rent_request_total = value.aggregation_rent_request_total_count
            $scope.rent_ticket_total = value.aggregation_rent_ticket_total
            $scope.rent_ticket_type = value.aggregation_rent_ticket_type
            return value
          })
          .then(function(value) {
            var graph_user_type = []
            _.map(value.aggregation_user_type, function(item) {
              graph_user_type.push({
                'label': item.type,
                'data': item.total
              })
            })
            $('#aggregation_user_type').css({'height':'200px'})
            $.plot($('#aggregation_user_type'), graph_user_type,
            {
            		series: {
            				pie: {
            						innerRadius: 0.5,
            						show: true
            				}
            		},
            		legend: {
            			show: false
            		},
            		colors: ['#FA5833', '#2FABE9', '#FABB3D', '#78CD51']
            });
          })
        }
      }
    }

    angular.module('app').controller('ctrlStatisticsOverview', ctrlStatisticsOverview)

})()
