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
            addRole: function (id, role, config) {
                return $http.post('/api/1/user/admin/' + id + '/set_role', {role: role}, config)
            },
            setRole: function () {
                throw 'not implemented'
            },
            removeRole: function (id, role, config) {
                return $http.post('/api/1/user/admin/' + id + '/unset_role', {role: role}, config)
            }
        }

    }

    angular.module('app').factory('adminApi', adminApi)
})()
