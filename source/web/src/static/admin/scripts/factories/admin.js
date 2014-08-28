/* Created by frank on 14-8-23. */
(function () {

    function adminApi($http) {

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
            addRole: function (data, config) {
                return $http.post('/api/1/user/admin/' + data.id + '/set_role', data)
            },
            setRole: function () {
                throw 'not implemented'
            },
            removeRole: function (data, config) {
                return $http.post('/api/1/user/admin/' + data.id + '/unset_role', data)
            }
        }

    }

    angular.module('app').factory('adminApi', adminApi)
})()
