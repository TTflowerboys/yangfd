/* Created by frank on 14-8-23. */
(function () {

    function adApi($http) {

        return {
            getAll: function (config) {
                return $http.get('/api/1/user/admin/search', config)
            },
            getOne: function (id, config) {
                return $http.get('/api/1/user/' + id, config)
            },
            create: function (data, config) {
                return $http.post('/api/1/user/admin/add', data, config)
            },
            setRole: function () {

            }
        }

    }

    angular.module('app').factory('adApi', adApi)
})()
