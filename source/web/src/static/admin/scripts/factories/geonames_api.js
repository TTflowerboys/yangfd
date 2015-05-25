/* Created by frank on 14-8-21. */
(function () {

    function geonamesApi($http) {
        return {
            get: function (config) {
                config = config || {}
                config.params = config.params || {}
                angular.extend(config.params)
                return $http.get('/api/1/geonames/search', config)
            }
        }
    }

    angular.module('app').factory('geonamesApi', geonamesApi)
})()
