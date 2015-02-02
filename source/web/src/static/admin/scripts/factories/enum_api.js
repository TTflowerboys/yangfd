/* Created by frank on 14-8-14. */

(function () {

    function enumApi($http) {
        return {
            addEnum: function (type, value, slug) {
                var data = {
                    type: type,
                    slug: slug,
                    value: value
                }
                return $http.post('/api/1/enum/add', data, {errorMessage: true})
            },
            editEnum: function (id, type, value, slug) {
                var data = {
                    type: type,
                    slug: slug,
                    value: value
                }
                return $http.post('/api/1/enum/' + id + '/edit', data, {errorMessage: true})
            },
            addCity: function (countryId, value) {
                var data = {
                    type: 'city',
                    country: countryId,
                    value: value
                }
                return $http.post('/api/1/enum/add', data, {errorMessage: true})
            },
            editCity: function (id, countryId, value) {
                var data = {
                    type: 'city',
                    country: countryId,
                    value: value
                }
                return $http.post('/api/1/enum/' + id + '/edit', data, {errorMessage: true})
            },
            addState: function (countryId, value) {
                var data = {
                    type: 'state',
                    country: countryId,
                    value: value
                }
                return $http.post('/api/1/enum/add', data, {errorMessage: true})
            },
            editState: function (id, countryId, value) {
                var data = {
                    type: 'state',
                    country: countryId,
                    value: value
                }
                return $http.post('/api/1/enum/' + id + '/edit', data, {errorMessage: true})
            },
            addCountry: function (slug, value) {
                var data = {
                    type: 'country',
                    slug: slug,
                    value: value
                }
                return $http.post('/api/1/enum/add', data, {errorMessage: true})
            },
            editCountry: function (id, slug, value) {
                var data = {
                    type: 'country',
                    slug: slug,
                    value: value
                }
                return $http.post('/api/1/enum/' + id + '/edit', data, {errorMessage: true})
            },
            addBudget: function (limit, ceiling, currency, value) {
                var slug = 'budget:'
                slug += limit ? limit : ''
                slug += ','
                slug += ceiling ? ceiling : ''
                slug += ','
                slug += currency
                var data = {
                    type: 'budget',
                    slug: slug,
                    currency: currency,
                    value: value
                }
                return $http.post('/api/1/enum/add', data, {errorMessage: true})
            },
            editBudget: function (id, limit, ceiling, currency, value) {
                var slug = 'budget:'
                slug += limit ? limit : ''
                slug += ','
                slug += ceiling ? ceiling : ''
                slug += ','
                slug += currency
                var data = {
                    type: 'budget',
                    slug: slug,
                    currency: currency,
                    value: value
                }
                return $http.post('/api/1/enum/' + id + '/edit', data, {errorMessage: true})
            },
            addIntention: function (value, description, slug) {
                var data = {
                    type: 'intention',
                    value: value,
                    slug: slug,
                    description: description
                }
                return $http.post('/api/1/enum/add', data, {errorMessage: true})
            },
            editIntention: function (id, value, description, slug) {
                var data = {
                    type: 'intention',
                    value: value,
                    slug: slug,
                    description: description
                }
                return $http.post('/api/1/enum/' + id + '/edit', data, {errorMessage: true})
            },
            getEnumsByType: function (type) {
                return $http.get('/api/1/enum', {
                    params: {
                        type: type,
                        _i18n: 'disabled'
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
            },
            searchCityByCountryId: function (id, config) {
                return $http.get('/api/1/enum/search', angular.extend({
                    params: {_i18n: 'disabled', country: id},
                    errorMessage: true
                }, config))
            },
            remove: function (id, config) {
                return $http.post('/api/1/enum/' + id + '/remove', {mode: 'clean'}, config)
            },
            check: function (id, config) {
                return $http.post('/api/1/enum/' + id + '/check', null, config)
            }
        }

    }

    angular.module('app').factory('enumApi', enumApi)
})()
