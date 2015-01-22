/* Created by frank on 14-8-23. */
(function () {

    function userOrderApi($http, $stateParams) {
        return {
            getAll: function (config) {
                config = config || {}
                config.params = config.params || {}
                config.params = angular.extend({}, config.params, {
                    user_id: $stateParams.id,
                    type:'investment'
                })
                return $http.get('/api/1/order/search?_i18n=disabled', config)
            }
        }
    }

    angular.module('app').factory('userOrderApi', userOrderApi)
})()