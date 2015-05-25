/* Created by frank on 14-8-21. */
(function () {

    function geonamesApi($http) {
        return {
            get: function (config) {
                return $http.get('/api/1/geonames/search', config)
            }
        }
    }

    angular.module('app').factory('geonamesApi', geonamesApi)
})()
