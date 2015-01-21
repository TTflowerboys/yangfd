/* Created by frank on 14-8-23. */
(function () {

    function userLogApi($http,$stateParams) {
        return {
            getAll: function (id, config) {
                config = config || {}
                config.params = config.params || {}
                config.params = {
                    user_id: $stateParams.id
                }
                return $http.get('/api/1/log/search', config)
            }
        }
    }

    angular.module('app').factory('userLogApi', userLogApi)
})()
