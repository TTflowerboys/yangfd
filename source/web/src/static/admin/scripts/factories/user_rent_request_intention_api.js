/* Created by frank on 14-8-23. */
(function () {

    function userRentRequestIntentionApi($http, $stateParams) {
        return {
            getAll: function (config) {
                config = config || {}
                config.params = angular.extend({}, config.params, {
                    user_id: $stateParams.id,
                })
                return $http.get('/api/1/rent_intention_ticket/search?status=requested', config)
            },
            update: function (data, config) {
                return $http.post('/api/1/rent_intention_ticket/' + data.id + '/edit', data, config)
            },
            remove: function (id, config) {
                return $http.post('/api/1/rent_intention_ticket/' + id + '/remove', null, config)
            },
            getLog: function (id, config) {
                return $http.post('/api/1/log/search', {ticket_id: id, type: 'ticket_add'}, config)
            }
        }

    }

    angular.module('app').factory('userRentRequestIntentionApi', userRentRequestIntentionApi)
})()
