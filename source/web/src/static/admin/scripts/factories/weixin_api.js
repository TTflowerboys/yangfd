/**
 * Created by zhou on 14-12-11.
 */
(function () {

    function weixinApi($http, $stateParams) {
        return {
            getAll: function (config) {
                return $http.get('/api/1/wechat/menu/get', config)
            },
            remove: function (config) {
                return $http.post('/api/1/wechat/menu/delete', null, config)
            },
            create: function (data, config) {
                return $http.post('/api/1/wechat/menu/create', {json: data}, config)
            }
        }
    }

    angular.module('app').factory('weixinApi', weixinApi)
})()
