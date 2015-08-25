/* Created by frank on 14-9-11. */
(function () {

    function appversionApi($http) {

        return {
            getAll: function (config) {
                return $http.get('/api/1/app/currant/version', config)
            },
            getOne: function (id, config) {
                return $http.get('/api/1/app/currant/version/' + id, config)
            },
            update: function (data, config) {
                return $http.post('/api/1/app/currant/version/' + data.id + '/update', data, config)
            },
            remove: function (id, config) {
                return $http.post('/api/1/app/currant/version/' + id + '/update', {status: 'deleted'}, config)
            },
            create: function (data, config) {
                return $http.post('/api/1/app/currant/version/add', data, config)
            },
        }
    }
    angular.module('app').factory('appversionApi', appversionApi)
})()
