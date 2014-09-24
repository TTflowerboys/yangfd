/* Created by frank on 14-8-23. */
(function () {

    function userFavApi($http,$stateParams) {
        return {
            getAll: function (id, config) {
                return $http.get('/api/1/user/admin/' + $stateParams.id + '/favorite', config)
            }
        }

    }

    angular.module('app').factory('userFavApi', userFavApi)
})()
