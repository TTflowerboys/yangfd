
(function () {

    function user_portrait_api($http) {

        return {
            get_users_portrait_general: function (date_from, date_to) {
              return $http.get('/api/1/get-users-portrait' + '?date_from=' + date_from + '&date_to=' + date_to)
            },
            get_users_portrait_tenants: function (date_from, date_to) {
              return $http.get('/api/1/get-users-portrait-tenants-behavior' + '?date_from=' + date_from + '&date_to=' + date_to)
            },
            get_users_portrait_landlord: function (date_from, date_to) {
              return $http.get('/api/1/get-users-portrait-landlord-behavior' + '?date_from=' + date_from + '&date_to=' + date_to)
            }
        }
    }

    angular.module('app').factory('user_portrait_api', user_portrait_api)
})()
