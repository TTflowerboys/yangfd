
(function () {

    function statisticsApi($http) {

        return {
            get_general: function (date_from, date_to) {
                return $http.get('/api/1/aggregation-general' + '?date_from=' + date_from + '&date_to=' + date_to)
            }
        }
    }

    angular.module('app').factory('statisticsApi', statisticsApi)
})()
