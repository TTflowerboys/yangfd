/* Created by frank on 14-8-23. */
(function () {

    function userRentIntentionApi($http, $stateParams) {
        return {
            getAll: function (config) {
                config = config || {}
                config.params = angular.extend({}, config.params, {
                    user_id: $stateParams.id,
                })
                return $http.get('/api/1/rent_intention_ticket/search', config)
            },
            update: function (data, config) {
                return $http.post('/api/1/rent_intention_ticket/' + data.id + '/edit', data, config)
            },
            remove: function (id, config) {
                return $http.post('/api/1/rent_intention_ticket/' + id + '/remove')
            }
        }

    }

    angular.module('app').factory('userRentIntentionApi', userRentIntentionApi)
})()
