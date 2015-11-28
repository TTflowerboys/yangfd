/* Created by frank on 14-9-11. */
(function () {

    function rentIntentionApi($http) {

        return {
            getAll: function (config) {
                return $http.get('/api/1/rent_intention_ticket/search?status=new', config)
            },
            getOne: function (id, config) {
                return $http.get('/api/1/rent_intention_ticket/' + id , config)
            },
            update: function (data, config) {
                return $http.post('/api/1/rent_intention_ticket/' + data.id + '/edit', data, config)
            },
            remove: function (id, config) {
                return $http.post('/api/1/rent_intention_ticket/' + id + '/remove', null, config)
            },
            create: function (data, config) {
                return $http.post('/api/1/rent_intention_ticket/add', data, config)
            },
            getHistory: function (id, config) {
                return $http.get('/api/1/rent_intention_ticket/' + id + '/history', config)
            },
            getRefer: function (id, config) {
                return $http.post('/api/1/log/search', {ticket_id: id, type: 'ticket_add'}, config)
            }
        }

    }

    angular.module('app').factory('rentIntentionApi', rentIntentionApi)
})()
