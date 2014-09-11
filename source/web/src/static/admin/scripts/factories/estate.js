/* Created by frank on 14-8-23. */
(function () {

    function estateApi($http) {

        return {
            getAll: function (config) {
                return $http.get('/api/1/property/search', config)
            },
            getOne: function (id, config) {
                return $http.get('/api/1/property/' + id, config)
            },
            update: function (data, config) {
                return $http.post('/api/1/property/' + data.id + '/edit', data, config)
            },
            remove: function (id, config) {
                return $http.post('/api/1/property/' + id + '/remove', null, config)
            },
            create: function (data, config) {
                return $http.post('/api/1/property/none/edit', data, config)
            }
        }

    }

    angular.module('app').factory('estateApi', estateApi)
})()
