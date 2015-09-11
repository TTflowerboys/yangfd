(function () {

    function venueApi($http) {

        return {
            getAll: function (config) {
                return $http.get('/api/1/venue/search?_i18n=disabled', config)
            },
            getOne: function (id, config) {
                return $http.get('/api/1/venue/' + id + '?_i18n=disabled', config)
            },
            update: function (data, config) {
                return $http.post('/api/1/venue/' + data.id + '/edit?_i18n=disabled', data, config)
            },
            remove: function (id, config) {
                return $http.post('/api/1/venue/' + id + '/edit', {status: 'deleted'}, config)
            },
            create: function (data, config) {
                return $http.post('/api/1/venue/add?_i18n=disabled', data, config)
            },
        }

    }

    angular.module('app').factory('venueApi', venueApi)
})()