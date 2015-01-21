/**
 * Created by zhou on 15-1-13.
 */
(function () {

    function crowdfundingApi($http, $stateParams, misc) {

        return {
            getAll: function (config) {
                return $http.get('/api/1/shop/' + $stateParams.shop_id + '/item/search?_i18n=disabled', config)
            },
            getOne: function (id, config) {
                return $http.get('/api/1/shop/' + $stateParams.shop_id + '/item/' + id + '?_i18n=disabled', config)
            },
            update: function (data, config) {
                data = misc.formatUnsetField(data)
                return $http.post('/api/1/shop/' + $stateParams.shop_id + '/item/' + data.id + '/edit?_i18n=disabled',
                    data, config)
            },
            remove: function (id, config) {
                return $http.post('/api/1/shop/' + $stateParams.shop_id + '/item/' + id + '/remove', config)
            },
            create: function (data, config) {
                return $http.post('/api/1/shop/' + $stateParams.shop_id + '/item/none/edit?_i18n=disabled', data,
                    config)
            }
        }

    }

    angular.module('app').factory('crowdfundingApi', crowdfundingApi)
})()
