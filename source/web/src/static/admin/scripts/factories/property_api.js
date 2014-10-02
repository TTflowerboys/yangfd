/* Created by frank on 14-8-23. */
(function () {

    function propertyApi($http) {

        return {
            getAll: function (config) {
                return $http.get('/api/1/property/search?_i18n=disabled',
                    config)
            },
            getOne: function (id, config) {
                return $http.get('/api/1/property/' + id + '?_i18n=disabled', config)
            },
            update: function (data, config) {
                return $http.post('/api/1/property/' + data.id + '/edit?_i18n=disabled', data, config)
            },
            remove: function (id, config) {
                return $http.post('/api/1/property/' + id + '/edit', {status: 'deleted'}, config)
            },
            create: function (data, config) {
                return $http.post('/api/1/property/none/edit', data, config)
            }
        }

    }

    angular.module('app').factory('propertyApi', propertyApi)
})()
