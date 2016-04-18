/* Created by frank on 14-9-11. */
(function () {

    function rentRequestIntentionApi($http) {

        return {
            getAll: function (config) {
                return $http.get('/api/1/rent_intention_ticket/search?_i18n=disabled', config)
            },
            getOne: function (id, config) {
                return $http.get('/api/1/rent_intention_ticket/' + id + '?_i18n=disabled', config)
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
            getHistory: function (params, config) {
                return $http.post('/api/1/rent_intention_ticket/' + params.id + '/history', params, config)
            },
            editHistory: function (ticketId, ticketHistoryId, data, config) {
                return $http.post('/api/1/rent_intention_ticket/' + ticketId + '/history/' + ticketHistoryId + '/edit', data, config)
            },
            getLog: function (id, config) {
                return $http.post('/api/1/log/search', {ticket_id: id, type: 'ticket_add'}, config)
            },
            rentIntentionTicketSmsSend: function (id, data, config) {
                return $http.post('/api/1/rent_intention_ticket/' + id + '/sms/send', data, config)
            }
        }

    }

    angular.module('app').factory('rentRequestIntentionApi', rentRequestIntentionApi)
})()
