
(function () {

    function requestRentApi($http) {

        return {
            getAll: function (config) {
                return $http.get('/api/1/rent_request_ticket/search', config)
            },
            getOne: function (id, config) {
                return $http.get('/api/1/rent_request_ticket/' + id , config)
            },
            update: function (data, config) {
                return $http.post('/api/1/rent_request_ticket/' + data.id + '/edit', data, config)
            },
            remove: function (id, config) {
                return $http.post('/api/1/rent_request_ticket/' + id + '/remove', null, config)
            },
            create: function (data, config) {
                return $http.post('/api/1/rent_request_ticket/add', data, config)
            },
        }

    }

    angular.module('app').factory('requestRentApi', requestRentApi)
})()