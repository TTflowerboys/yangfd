/* Created by frank on 14-8-23. */
(function () {

    function userFavApi($http, $stateParams) {
        return {
            getAll: function (config) {
                return $http.get('/api/1/user/admin/' + $stateParams.id + '/favorite', config)
            },
            remove: function (id, config) {
                return $http.post('/api/1/rent_ticket/' + id + '/edit', {status: 'deleted'}, config)
            }
        }

    }

    angular.module('app').factory('userFavApi', userFavApi)
})()
