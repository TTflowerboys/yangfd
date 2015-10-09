(function () {

    function indexRuleApi($http) {

        return {
            getAll: function (config) {
                return $http.get('/api/1/index_rule/channel/all?_i18n=disabled&sort=last_modified_time,desc', config)
            },
            getChannel: function (channel, config) {
                return $http.get('/api/1/index_rule/channel/' + channel + '/rules?_i18n=disabled&sort=last_modified_time,desc', config)
            },

            update: function (data, config) {
                return $http.post('/api/1/index_rule/' + data.id + '/edit', data, config)
            },
            remove: function (id, config) {
                return $http.post('/api/1/index_rule/' + id + '/delete', null, config)
            },
            create: function (data, config) {
                return $http.post('/api/1/index_rule/add', data, config)
            },

        }

    }

    angular.module('app').factory('indexRuleApi', indexRuleApi)
})()
