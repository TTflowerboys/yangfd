/**
 * Created by zhou on 15-1-13.
 */
(function () {

    function crowdfundingApi($http) {

        return {
            getAll: function (shopId, config) {
                return $http.get('/api/1/shop/' + shopId + '/item/search?_i18n=disabled', config)
            },
            getOne: function (shopId, id, config) {
                return $http.get('/api/1/shop/' + shopId + '/item/' + id + '?_i18n=disabled', config)
            },
            update: function (shopId, data, config) {
                return $http.post('/api/1/shop/' + shopId + '/item/' + data.id + '/edit', data, config)
            },
            remove: function (shopId, id, config) {
                return $http.post('/api/1/shop/' + shopId + '/item/' + id + '/remove', config)
            },
            create: function (shopId, data, config) {
                return $http.post('/api/1/shop/' + shopId + '/item/none/edit', data, config)
            }
        }

    }

    angular.module('app').factory('crowdfundingApi', crowdfundingApi)
})()
