/**
 * Created by Michael on 14/9/18.
 */
(function () {

    function geoApi($http) {
        return {
            getCitiesByCountry: function (config) {
                config = config || {}
                config.params = config.params || {}
                return $http.get('/api/1/geo/city/search', config)
            },
            getCountries: function ( config) {
                return $http.get('/api/1/geo/country', config)
            },
        }

    }

    angular.module('app').factory('geoApi', geoApi)
})()
