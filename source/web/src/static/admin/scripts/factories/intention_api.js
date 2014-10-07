/* Created by frank on 14-9-11. */
(function () {

    function intentionApi($http) {

        return {
            getAll: function (config) {
                return $http.get('/api/1/intention_ticket/search?_i18n=disabled&sort=last_modified_time,desc', config)
            },
            getOne: function (id, config) {
                return $http.get('/api/1/intention_ticket/' + id + '?_i18n=disabled', config)
            },
            update: function (data, config) {
                return $http.post('/api/1/intention_ticket/' + data.id + '/edit', data, config)
            },
            remove: function (id, config) {
                return $http.post('/api/1/intention_ticket/' + id + '/remove', null, config)
            },
            create: function (data, config) {
                return $http.post('/api/1/intention_ticket/add', data, config)
            },
            history: function (id, config) {
                return $http.get('/api/1/intention_ticket/' + id + '/history', config)
            }
        }

    }

    angular.module('app').factory('intentionApi', intentionApi)
})()
