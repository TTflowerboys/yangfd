/**
 * Created by zhou on 14-12-11.
 */
(function () {

    function weixinApi($http, $stateParams) {
        var config
        return {
            getMenu: function () {
                config = config || {}
                config.params = config.params || {}
                return $http.get('https://api.weixin.qq.com/cgi-bin/menu/get?access_token=HSkz5fc2DOBwF48Rk0d6fbbn29yfuoQTBxGvJekyPg_2TebOGShUnJmBcDGqGwuXj_HNDgAdAT8ytvHYUEtYzThdp_I-ocJDWzvu1QTFLzo',
                    config)
            },
            updateMenu: function (data, config) {
                return $http.post('https://api.weixin.qq.com/cgi-bin/menu/create?access_token=HSkz5fc2DOBwF48Rk0d6fbbn29yfuoQTBxGvJekyPg_2TebOGShUnJmBcDGqGwuXj_HNDgAdAT8ytvHYUEtYzThdp_I-ocJDWzvu1QTFLzo',
                    data, config)
            }
        }
    }

    angular.module('app').factory('weixinApi', weixinApi)
})()
