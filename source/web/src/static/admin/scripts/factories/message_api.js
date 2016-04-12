/**
 * Created by Michael on 14/10/29.
 */
(function () {

    function messageApi($http) {

        return {
            create: function (data, config) {
                return $http.post('/api/1/message/add', data, config)
            },
            getStatistics: function (config) {
                return $http.get('/api/1/message/statistics', config)
            },
            receive: function (data, config) {
                return $http.post('/api/1/message?_i18n=disabled', data, config)
            },
            getAll: function (data, config) {
                return $http.post('/api/1/message/search?_i18n=disabled', data, config)
            },
            getOne: function (id, config) {
                return $http.get('/api/1/message/' + id + '?_i18n=disabled', config)
            },
            mark: function (id, status, config) {
                return $http.get('/api/1/message/' + id + '/mark/' + status, config)
            },
            remove: function (id, config) {
                return $http.get('/api/1/message/' + id + '/delete')
            }
        }

    }

    angular.module('app').factory('messageApi', messageApi)
})()
