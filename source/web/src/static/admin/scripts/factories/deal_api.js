(function () {

    function dealApi($http) {

        return {
            getAll: function (venueId, config) {
                return $http.get('/api/1/venue/' + venueId + '/deals?_i18n=disabled', config)
            },
            getOne: function (id, config) {
                return $http.get('/api/1/deal/' + id + '?_i18n=disabled', config)
            },
            update: function (venueId, data, config) {
                return $http.post('/api/1/venue/' + venueId + '/deal/' + data.id + '/edit?_i18n=disabled', data, config)
            },
            remove: function (venueId, id, config) {
                return $http.post('/api/1/venue/' + venueId + '/deal/' + id + '/remove', {}, config)
            },
            create: function (venueId, data, config) {
                return $http.post('/api/1/venue/' + venueId + '/deal/add?_i18n=disabled', data, config)
            },
        }

    }

    angular.module('app').factory('dealApi', dealApi)
})()