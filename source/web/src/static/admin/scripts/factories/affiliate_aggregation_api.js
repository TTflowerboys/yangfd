
(function () {

    function affiliate_aggregation_api($http) {

        return {
            get_aggregation: function (data) {
              return $http.post('/api/1/affiliate-get-aggregation', data)
            }
        }
    }

    angular.module('app').factory('affiliate_aggregation_api', affiliate_aggregation_api)
})()
