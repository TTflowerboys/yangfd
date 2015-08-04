(function () {

    function reportApi($http) {

        return {
            search: function (data, config) {
                return $http.post('/api/1/report/search?_i18n=disabled', data, config)
            },
        }

    }

    angular.module('app').factory('reportApi', reportApi)
})()
