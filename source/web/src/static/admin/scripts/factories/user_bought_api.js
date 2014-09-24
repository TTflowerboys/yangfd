/* Created by frank on 14-8-23. */
(function () {

    function userBoughtApi($http,$stateParams) {
        return {
            getAll: function (id, config) {
                config = config || {}
                config.params = config.params || {}
                config.params = {
                    user_id: $stateParams.id,
                    status: 'bought'
                }
                return $http.get('/api/1/intention_ticket/search', config)
            }
        }
    }

    angular.module('app').factory('userBoughtApi', userBoughtApi)
})()
