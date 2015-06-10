/**
 * Created by Michael on 14/10/29.
 */
(function () {

    function invitationApi($http) {

        return {
            invite: function (email, config) {
                var data = {
                    email:email
                }
                return $http.post('/api/1/user/admin/invite', data, config)
            },
            create: function(email, config) {
                var data = {
                    email:email
                }
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
                return $http.get('/reverse_proxy?link=' + encodeURIComponent('http://freegeoip.net/json/' + ip))
            }
        }

    }

    angular.module('app').factory('invitationApi', invitationApi)
})()
