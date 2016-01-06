(function () {

    function ctrlStatisticsOverview($scope, fctModal, api, $stateParams, $q) {

      $scope.get_aggregate_data = function () {

        if ($scope.selected.date_from && $scope.selected.date_to && ($scope.selected.date_from < $scope.selected.date_to)) {
          var date_start = new Date($scope.selected.date_from*1000)
          var date_end = new Date($scope.selected.date_to*1000)
          if ($scope.time_segment !== undefined) {
            var result = $scope.date_range_splite(date_start, date_end)
            $q.all(_.map(result, function(item) {
              return angular.extend(
                {},
                api.get_general(item.start.getTime(), item.end.getTime()),
                api.get_rent_request(item.start.getTime(), item.end.getTime()),
                api.get_rent_ticket(item.start.getTime(), item.end.getTime())
              )
            }))
            .then(function(resultArray){
              return _.map(resultArray, function(item){
                return item.data.val
              })
            })
            .then(function(resultfinal) {
              console.log(resultfinal)
              // for (var index = 0; index < resultfinal.length; index++) {
              //
              // }
              // var graph_data = {
              //   "xScale": "ordinal",
              //   "yScale": "ordinal",
              //   "main": [
              //     {
              //       "className": ".pizza",
              //       "data": [
              //         {
              //           "x": "2012-11-05",
              //           "y": 6
              //         },
              //         {
              //           "x": "2012-11-06",
              //           "y": 6
              //         },
              //         {
              //           "x": "2012-11-07",
              //           "y": 8
              //         }
              //       ]
              //     }
              //   ]
              // }
              // var opts = {
              //   "dataFormatX": function (x) { return d3.time.format('%Y-%m-%d').parse(x); },
              //   "tickFormatX": function (x) { return d3.time.format('%A')(x); }
              // };
              // var myChart = new xChart('line-dotted', graph_data, '#example4', opts);
            })
          }
          else {
            api.get_general($scope.selected.date_from, $scope.selected.date_to).success(on_refresh_general)
            api.get_rent_request($scope.selected.date_from, $scope.selected.date_to).success(on_refresh_rent_request)
            api.get_rent_ticket($scope.selected.date_from, $scope.selected.date_to).success(on_refresh_rent_ticket)
          }
        }
        (function () {

          var data = {
            'xScale': 'ordinal',
            'yScale': 'linear',
            'main': [
              {
                'className': '.pizza',
                'data': [
                  {
                    'x': 'Pepperoni',
                    'y': 4
                  },
                  {
                    'x': 'Cheese',
                    'y': 8
                  }
                ]
              }
            ]
          };
          var myChart = new xChart('bar', data, '#example4');

        }());
      }

      // $scope.get_aggregate_data = function () {
      //   if ($scope.selected.date_from && $scope.selected.date_to) {
      //       api.get_general($scope.selected.date_from, $scope.selected.date_to).success(on_refresh_general)
      //       api.get_rent_request($scope.selected.date_from, $scope.selected.date_to).success(on_refresh_rent_request)
      //       api.get_rent_ticket($scope.selected.date_from, $scope.selected.date_to).success(on_refresh_rent_ticket)
      //   }
      // }
      //
      // function on_refresh_general(data) {
      //   $scope.register_user_total = data.val.aggregation_register_user_total
      //   $scope.user_type_list = data.val.aggregation_user_type
      //   $scope.place_holder = '无'
      // }
      //
      // function on_refresh_rent_request(data) {
      //   $scope.rent_request_total = data.val.aggregation_rent_request_total_count
      //   $scope.place_holder = '无'
      // }
      //
      // function on_refresh_rent_ticket(data) {
      //   $scope.rent_ticket_total = data.val.aggregation_rent_ticket_total
      //   $scope.rent_ticket_type = data.val.aggregation_rent_ticket_type
      //   $scope.place_holder = '无'
      // }
    }

    angular.module('app').controller('ctrlStatisticsOverview', ctrlStatisticsOverview)

})()
