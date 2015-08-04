/**
 * Created by Michael on 14/10/29.
 */
(function () {

    function subscribeApi($http) {

        return {
            invite: function (email, config) {
                var data = {
                    email:email
                }
                return $http.post('/api/1/user/admin/invite', data, config)
            },
            create: function(data, config) {
                return $http.post('/api/1/subscription/add', data, config)
            },
            getAll: function (data, config) {
                return $http.get('/api/1/subscription/search', data, config)
            },
            update: function (id, status, config) {
                var data = {
                    status:status
                }
                return $http.post('/api/1/subscription/'+id+'/edit', data, config)
            },
            getCountry: function (ip) {
                return $http.get('/api/1/ip_country?ip=' + ip)
            },
            searchUserByEmail: function (email) {
                var data = {
                    email: email
                }
                return $http.post('/api/1/user/admin/search', data)
            }
        }

    }

    angular.module('app').factory('subscribeApi', subscribeApi)
})()
