(function () {

    function nexmoNumberApi($http) {
        return {
            getAll: function (config) {
                return $http.get('/api/1/nexmo_number/list?_i18n=disabled', config)
            },
            getOne: function (id, config) {
                return $http.get('/api/1/nexmo_number/' + id + '?_i18n=disabled', config)
            },
            update: function (data, config) {
                return $http.post('/api/1/nexmo_number/' + data.id + '/edit', data, config)
            },
            remove: function (id, config) {
                return $http.post('/api/1/nexmo_number/' + id + '/edit', {status: 'deleted'}, config)
            },
            create: function (data, config) {
                return $http.post('/api/1/nexmo_number/add', data, config)
            },
        }
    }

    angular.module('app').factory('nexmoNumberApi', nexmoNumberApi)
})()
