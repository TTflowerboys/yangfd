(function () {

    function rentApi($http, misc) {

        return {
            getAll: function (config) {
                return $http.get('/api/1/rent_ticket/search?_i18n=disabled',
                    config)
            },
            getOne: function (id, config) {
                return $http.get('/api/1/rent_ticket/' + id + '?_i18n=disabled', config)
            },
            update: function (id, data, config) {
                data = misc.formatUnsetField(data)
                return $http.post('/api/1/rent_ticket/' + id + '/edit', data, config)
            },
            suspend: function (id, config) {
                return $http.post('/api/1/rent_ticket/' + id + '/suspend', config)
            },
            remove: function (id, config) {
                return $http.post('/api/1/rent_ticket/' + id + '/edit', {status: 'deleted'}, config)
            },
            create: function (data, config) {
                return $http.post('/api/1/rent_ticket/none/edit', data, config)
            },
            generateImage: function (id) {
                return $http.post('/api/1/rent_ticket/' + id + '/generate_digest_image')
            },
            getDigestStatus: function (id) {
                return $http.post('/api/1/rent_ticket/' + id + '/digest_image_task_status')
            }
        }

    }

    angular.module('app').factory('rentApi', rentApi)
})()
