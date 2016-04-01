(function () {

    function user_portrait($scope, fctModal, $stateParams) {

      $scope.selected = {}
      $scope.date_range_splite = function (start, end) {
        var result = []
        var seg_start = start
        var seg_end
        if ($scope.date_forward(start) <= end) {
          seg_end = $scope.date_forward(start)
        }
        else {
          seg_end = end
        }
        while(seg_end <= end) {
          result.push({
            'start': seg_start,
            'end': seg_end
          })
          seg_start = seg_end
          if ($scope.date_forward(seg_end) > end && seg_end < end) {
            result.push({
              'start': seg_start,
              'end': end
            })
          }
          seg_end = $scope.date_forward(seg_end)
        }
        return result
      }

      $scope.date_forward = function (d) {
        if ($scope.time_segment === 'day') {
          return new Date(new Date(d).setDate(d.getDate() + 1))
        }
        else if ($scope.time_segment === 'week') {
          return new Date(new Date(d).setDate(d.getDate() + 7))
        }
        else if ($scope.time_segment === 'month') {
          return new Date(new Date(d).setMonth(d.getMonth() + 1))
        }
      }
    }
    angular.module('app').controller('user_portrait', user_portrait)

})()
