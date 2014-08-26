/* Created by frank on 14-8-21. */
(function () {

    function apiFactory($http) {
        return function (name) {

            return {
                getAll: function (config) {
                    return $http.get('/api/1/' + name, config)
                },
                getOne: function (id, config) {
                    return $http.get('/api/1/' + name + '/' + id, config)
                },
                update: function (data, config) {
                    return $http.post('/api/1/' + name + '/' + data.id + '/edit', data, config)
                },
                remove: function (id, config) {
                    return $http.post('/api/1/' + name + '/' + id + '/remove', null, config)
                },
                create: function (data, config) {
                    return $http.post('/api/1/' + name + '/add', data, config)
                }
            }

        }
    }

    angular.module('app').factory('apiFactory', apiFactory)
})()
