(function () {

    function userPropertyApi($http, $stateParams) {
        return {
            getAll: function (config) {
                config = config || {}
                config.params = config.params || {}
                config.params = angular.extend({}, config.params, {
                    user_id: $stateParams.id,
                    status: ['draft', 'to rent', 'hidden', 'rent'].join(',')
                })
                return $http.get('/api/1/rent_ticket/search?_i18n=disabled', config)
            },
            remove: function (id) {
                return $http.post('/api/1/rent_ticket/' + id + '/edit', {status: 'deleted'})
            }
        }
    }

    angular.module('app').factory('userPropertyApi', userPropertyApi)
})()