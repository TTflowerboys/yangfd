/**
 * Created by zhou on 15-1-13.
 */
(function () {

    function shopApi($http) {

        return {
            getAll: function (config) {
                return $http.get('/api/1/shop/search', config)
            },
            getOne: function (id, config) {
                return $http.get('/api/1/shop/' + id + '?_i18n=disabled', config)
            },
            update: function (data, config) {
                return $http.post('/api/1/shop/' + data.id + '/edit', data, config)
            },
            remove: function (id, config) {
                return $http.post('/api/1/shop/' + id + '/remove', config)
            },
            create: function (data, config) {
                return $http.post('/api/1/shop/add', data, config)
            }
        }

    }

    angular.module('app').factory('shopApi', shopApi)
})()
