/* Created by frank on 14-8-23. */
(function () {

    function adApi($http) {

        return {
            getChannels: function (config) {
                return $http.get('/api/1/ad/channels', config)
            },
            getAllAdsByChannel: function (channelName, config) {
                return $http.get('/api/1/ad/channel/' + channelName + '/all', config)
            },
            getRandomAdByChannel: function (channelName, config) {
                return $http.get('/api/1/ad/channel/' + channelName, config)
            },
            update: function (data, config) {
                return $http.post('/api/1/ad/' + data.id + '/edit', data, config)
            },
            remove: function (id, config) {
                return $http.post('/api/1/ad/' + id + '/remove', null, config)
            },
            create: function (data, config) {
                return $http.post('/api/1/ad/add', data, config)
            }
        }

    }

    angular.module('app').factory('adApi', adApi)
})()
