/* Created by frank on 14-8-23. */
(function () {

    function userIntentionApi($http, $stateParams) {
        return {
            getAll: function (config) {
                config = config || {}
                config.params = angular.extend({}, config.params, {
                    user_id: $stateParams.id,
                    status: 'new, assigned, in_progress, deposit, suspended,canceled'
                })
                return $http.get('/api/1/intention_ticket/search', config)
            }
        }

    }

    angular.module('app').factory('userIntentionApi', userIntentionApi)
})()
