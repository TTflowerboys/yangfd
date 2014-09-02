/* Created by frank on 14-8-23. */
(function () {

    function adminApi($http) {
        var defaultParams = {
            role_only: true
        }
        return {
            getAll: function (config) {
                config = config || {}
                config.params = config.params || {}
                angular.extend(config.params, defaultParams)
                return $http.get('/api/1/user/admin/search', config)
            },
            getOne: function (id, config) {
                return $http.get('/api/1/user/' + id, config)
            },
            create: function (data, config) {
                return $http.post('/api/1/user/admin/add', data, config)
            },
            addRole: function (id, role, config) {
                return $http.post('/api/1/user/admin/' + id + '/add_role', {role: role}, config)
            },
            setRole: function (id, role, config) {
                return $http.post('/api/1/user/admin/' + id + '/set_role', {role: role}, config)
            },
            removeRole: function (id, role, config) {
                return $http.post('/api/1/user/admin/' + id + '/unset_role', {role: role}, config)
            }
        }

    }

    angular.module('app').factory('adminApi', adminApi)
})()
