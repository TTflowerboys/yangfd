/* Created by frank on 14-8-14. */

(function () {

    function enumApi($http, $state, $q) {
        return {
            addEnum: function (type, value) {
                var params = {}
                params.type = type
                params.value = value
                return $http.post('/api/1/enum/add', params, {errorMessage: true})

            },
            editEnum: function (id, type, value) {
                var params = {}
                params.type = type
                params.value = value
                return $http.post('/api/1/enum/' + id + '/edit', params, {errorMessage: true})

            },
            getEnumsByType: function (type) {

                return $http.get('/api/1/enum', {params: {type: type}, errorMessage: true})
            },
            getI18nEnumsById: function (id) {
                return $http.get('/api/1/enum/' + id, {params: {_i18n: 'disabled'}, errorMessage: true})
            }
        }

    }

    angular.module('app').factory('enumApi', enumApi)
})()
