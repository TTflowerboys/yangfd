
(function () {

    function logApi($http) {

        return {
            searchLastestQueryKeywords: function (rawParams) {
                var params = $.extend({}, rawParams.params)
                params.has_query = 1
                rawParams.params = params
                return $http.get('/api/1/log/search', rawParams)
            },

        }
    }

    angular.module('app').factory('logApi', logApi)
})()
