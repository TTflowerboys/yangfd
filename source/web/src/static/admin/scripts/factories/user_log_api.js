/* Created by frank on 14-8-23. */
(function () {

    function userLogApi($http, $stateParams) {
        return {
            getAll: function (config) {
                config = config || {}
                config.params = config.params || {}
                config.params = angular.extend({}, config.params, {
                    has_property: true,
                    user_id: $stateParams.id
                })
                return $http.get('/api/1/log/search?_i18n=disabled', config)
            }
        }
    }

    angular.module('app').factory('userLogApi', userLogApi)
})()
