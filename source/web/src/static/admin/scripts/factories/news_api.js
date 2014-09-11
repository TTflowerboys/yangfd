/* Created by frank on 14-9-11. */
(function () {

    function newsApi($http) {

        return {
            getAll: function (config) {
                return $http.get('/api/1/news/search', config)
            },
            getOne: function (id, config) {
                return $http.get('/api/1/news/' + id, config)
            },
            update: function (data, config) {
                return $http.post('/api/1/news/' + data.id + '/edit', data, config)
            },
            remove: function (id, config) {
                return $http.post('/api/1/news/' + id + '/remove', null, config)
            },
            create: function (data, config) {
                return $http.post('/api/1/news/add', data, config)
            }
        }

    }

    angular.module('app').factory('newsApi', newsApi)
})()
