/* Created by frank on 14-8-21. */
(function () {

    function channelApi($http) {
        return {
            getAll: function (config) {
                return $http.get('/api/1/ad/channels', config)
            }
        }
    }

    angular.module('app').factory('channelApi', channelApi)
})()
