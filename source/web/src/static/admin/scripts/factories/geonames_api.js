/* Created by frank on 14-8-21. */
(function () {

    function geonamesApi($http,$rootScope) {
        return {
            getAll: function (config) {
                config = config || {}
                config.params = config.params || {}
                angular.extend(config.params)
                return $http.get('/api/1/geonames/search', config)
            },
            getById:function(id){
                return $http.get('/api/1/geonames/'+id)
            }

        }
    }

    angular.module('app').factory('geonamesApi', geonamesApi)
})()
