
(function () {

    function statisticsApi($http) {

        return {
            get_general: function (date_from, date_to) {
              return $http.get('/api/1/aggregation-general' + '?date_from=' + date_from + '&date_to=' + date_to)
            },
            get_rent_ticket: function (date_from, date_to) {
              return $http.get('/api/1/aggregation-rent-ticket' + '?date_from=' + date_from + '&date_to=' + date_to)
            },
            get_rent_intention_ticket: function (date_from, date_to) {
              return $http.get('/api/1/aggregation-rent-intention-ticket' + '?date_from=' + date_from + '&date_to=' + date_to)
            },
            get_property_view: function (date_from, date_to) {
              return $http.get('/api/1/aggregation-property-view' + '?date_from=' + date_from + '&date_to=' + date_to)
            },
            get_email_detail: function (date_from, date_to) {
              return $http.get('/api/1/aggregation-email-detail' + '?date_from=' + date_from + '&date_to=' + date_to)
            },
            get_favorite: function (date_from, date_to) {
              return $http.get('/api/1/aggregation-favorite' + '?date_from=' + date_from + '&date_to=' + date_to)
            },
            get_rent_request: function (date_from, date_to) {
              return $http.get('/api/1/aggregation-rent-request' + '?date_from=' + date_from + '&date_to=' + date_to)
            },
            get_view_contact: function (date_from, date_to) {
              return $http.get('/api/1/aggregation-view-contact' + '?date_from=' + date_from + '&date_to=' + date_to)
            }
        }
    }

    angular.module('app').factory('statisticsApi', statisticsApi)
})()
