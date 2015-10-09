/* Created by frank on 14-8-23. */
(function () {

    function userViewContactInfoPropertyApi($http, $stateParams) {
        return {
            getAll: function (config) {
                config = config || {}
                config.params = angular.extend({}, config.params, {
                    user_id: $stateParams.id,
                })
                return $http.get('/api/1/order/search_view_rent_ticket_contact_info', config)
            },
            update: function (data, config) {
                return $http.post('/api/1/rent_ticket/' + data.id + '/edit', data, config)
            },
            remove: function (id, config) {
                return $http.post('/api/1/rent_ticket/' + id + '/edit', {status: 'deleted'}, config)
            }
        }

    }

    angular.module('app').factory('userViewContactInfoPropertyApi', userViewContactInfoPropertyApi)
})()
