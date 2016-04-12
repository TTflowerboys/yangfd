(function () {

    function miscApi($http) {
        return {
            getShorturl: function (url, config) {
                return $http.post('/api/1/shorturl', {url: url}, config)
            },
        }
    }

    angular.module('app').factory('miscApi', miscApi)
})()
