/* Created by frank on 14-8-23. */
(function () {

    function adApiFactory($http) {

        return function (name) {

            return {
                getAll: function (config) {
                    return $http.get('/api/1/ad/channel/' + name + '/all?_i18n=disabled', config)
                },
                getOne: function (id, config) {
                    return $http.get('/api/1/ad/' + id +'?_i18n=disabled', config)
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

    }

    angular.module('app').factory('adApiFactory', adApiFactory)
})()
