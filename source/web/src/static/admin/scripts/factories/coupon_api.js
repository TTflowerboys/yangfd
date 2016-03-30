(function () {

    function couponApi($http) {
        return {
            search: function (params, config) {
                return $http.post('/api/1/coupon/search?_i18n=disabled', params, config)
            },
            update: function (data, config) {
                return $http.post('/api/1/coupon/' + data.id + '/edit', data, config)
            },
        }
    }

    angular.module('app').factory('couponApi', couponApi)
})()
