/* Created by frank on 14-8-14. */

(function () {

    function enumApi($http, $state, $q) {
        return {
            addEnum: function (type, value) {
                var data = {
                    type: type,
                    value: value
                }
                return $http.post('/api/1/enum/add', data, {errorMessage: true})

            },
            editEnum: function (id, type, value) {
                var data = {
                    type: type,
                    value: value
                }
                return $http.post('/api/1/enum/' + id + '/edit', data, {errorMessage: true})

            },
            getEnumsByType: function (type) {
                return $http.get('/api/1/enum', {
                    params: {
                        type: type
                    }
                })
            },
            // origin means non-i18n
            getOriginEnumsByType: function (type) {
                return $http.get('/api/1/enum', {
                    params: {
                        type: type,
                        _i18n: 'disabled'
                    }
                })
            },
            getI18nEnumsById: function (id, config) {
                return $http.get('/api/1/enum/' + id, angular.extend({
                    params: {_i18n: 'disabled'},
                    errorMessage: true
                }, config))
            }
        }

    }

    angular.module('app').factory('enumApi', enumApi)
})()
