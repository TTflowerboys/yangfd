/**
 * Created by Michael on 14/10/29.
 */
(function () {

    function messageApi($http) {

        return {
            create: function (data, config) {
                return $http.post('/api/1/message/add', data, config)
            },
            getStatistics: function (config) {
                return $http.get('/api/1/message/statistics', config)
            }
        }

    }

    angular.module('app').factory('messageApi', messageApi)
})()
