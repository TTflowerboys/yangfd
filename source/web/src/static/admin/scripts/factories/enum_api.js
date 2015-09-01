/* Created by frank on 14-8-14. */

(function () {

    function enumApi($http) {
        return {
            addEnum: function (type, value, slug, sort_value) {
                var data = {
                    type: type,
                    slug: slug,
                    value: value,
                    sort_value: sort_value || 0
                }
                return $http.post('/api/1/enum/add', data, {errorMessage: true})
            },
            editEnum: function (id, type, value, slug, sort_value) {
                var data = {
                    type: type,
                    slug: slug,
                    value: value,
                    sort_value: sort_value || 0
                }
                return $http.post('/api/1/enum/' + id + '/edit', data, {errorMessage: true})
            },
            addCity: function (countryId, value, sort_value) {
                var data = {
                    type: 'city',
                    country: countryId,
                    value: value,
                    sort_value: sort_value || 0
                }
                return $http.post('/api/1/enum/add', data, {errorMessage: true})
            },
            editCity: function (id, countryId, value, sort_value) {
                var data = {
                    type: 'city',
                    country: countryId,
                    value: value,
                    sort_value: sort_value || 0
                }
                return $http.post('/api/1/enum/' + id + '/edit', data, {errorMessage: true})
            },
            addState: function (countryId, value, sort_value) {
                var data = {
                    type: 'state',
                    country: countryId,
                    value: value,
                    sort_value: sort_value || 0
                }
                return $http.post('/api/1/enum/add', data, {errorMessage: true})
            },
            editState: function (id, countryId, value, sort_value) {
                var data = {
                    type: 'state',
                    country: countryId,
                    value: value,
                    sort_value: sort_value || 0
                }
                return $http.post('/api/1/enum/' + id + '/edit', data, {errorMessage: true})
            },
            addCountry: function (slug, value, sort_value) {
                var data = {
                    type: 'country',
                    slug: slug,
                    value: value,
                    sort_value: sort_value || 0
                }
                return $http.post('/api/1/enum/add', data, {errorMessage: true})
            },
            editCountry: function (id, slug, value, sort_value) {
                var data = {
                    type: 'country',
                    slug: slug,
                    value: value,
                    sort_value: sort_value || 0
                }
                return $http.post('/api/1/enum/' + id + '/edit', data, {errorMessage: true})
            },
            addBudget: function (limit, ceiling, currency, value, sort_value) {
                var slug = 'budget:'
                slug += limit !== undefined ? limit : ''
                slug += ','
                slug += ceiling !== undefined ? ceiling : ''
                slug += ','
                slug += currency
                var data = {
                    type: 'budget',
                    slug: slug,
                    currency: currency,
                    value: value,
                    sort_value: sort_value || 0
                }
                return $http.post('/api/1/enum/add', data, {errorMessage: true})
            },
            editBudget: function (id, limit, ceiling, currency, value, sort_value) {
                var slug = 'budget:'
                slug += limit !== undefined ? limit : ''
                slug += ','
                slug += ceiling !== undefined ? ceiling : ''
                slug += ','
                slug += currency
                var data = {
                    type: 'budget',
                    slug: slug,
                    currency: currency,
                    value: value,
                    sort_value: sort_value || 0
                }
                return $http.post('/api/1/enum/' + id + '/edit', data, {errorMessage: true})
            },
            addBuildingArea: function (limit, ceiling, area, value, sort_value) {
                var slug = 'building_area:'
                slug += limit !== undefined ? limit : ''
                slug += ','
                slug += ceiling !== undefined ? ceiling : ''
                slug += ','
                slug += area
                var data = {
                    type: 'building_area',
                    slug: slug,
                    value: value,
                    sort_value: sort_value || 0
                }
                return $http.post('/api/1/enum/add', data, {errorMessage: true})
            },
            editBuildingArea: function (id, limit, ceiling, area, value, sort_value) {
                var slug = 'building_area:'
                slug += limit !== undefined ? limit : ''
                slug += ','
                slug += ceiling !== undefined ? ceiling : ''
                slug += ','
                slug += area
                var data = {
                    type: 'building_area',
                    slug: slug,
                    value: value,
                    sort_value: sort_value || 0
                }
                return $http.post('/api/1/enum/' + id + '/edit', data, {errorMessage: true})
            },
            addRoomCount: function (limit, ceiling, type, value, sort_value) {
                var slug = type+':'
                slug += limit !== undefined ? limit : ''
                slug += ','
                slug += ceiling !== undefined ? ceiling : ''
                var data = {
                    type: type,
                    slug: slug,
                    value: value,
                    sort_value: sort_value || 0
                }
                return $http.post('/api/1/enum/add', data, {errorMessage: true})
            },
            editRoomCount: function (id, limit, ceiling, type, value, sort_value) {
                var slug = type+':'
                slug += limit !== undefined ? limit : ''
                slug += ','
                slug += ceiling !== undefined ? ceiling : ''
                var data = {
                    type: type,
                    slug: slug,
                    value: value,
                    sort_value: sort_value || 0
                }
                return $http.post('/api/1/enum/' + id + '/edit', data, {errorMessage: true})
            },
            addIntention: function (value, description, slug, sort_value) {
                var data = {
                    type: 'intention',
                    value: value,
                    slug: slug,
                    description: description,
                    sort_value: sort_value || 0
                }
                return $http.post('/api/1/enum/add', data, {errorMessage: true})
            },
            editIntention: function (id, value, description, slug, sort_value) {
                var data = {
                    type: 'intention',
                    value: value,
                    slug: slug,
                    description: description,
                    sort_value: sort_value || 0
                }
                return $http.post('/api/1/enum/' + id + '/edit', data, {errorMessage: true})
            },
            getEnumsByType: function (type, status) {
                var params = {
                    type: type,
                    _i18n: 'disabled'
                }
                if(status) {
                    params = angular.extend(params, {
                        status: JSON.stringify([status])
                    })
                }
                return $http.get('/api/1/enum/search', {
                    params: params
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
                    params: {_i18n: 'disabled', country: id, type: 'city'},
                    errorMessage: true
                }, config))
            },
            addRentBudget: function (limit, ceiling, currency, value, sort_value) {
                var slug = 'rent_budget:'
                slug += limit !== undefined ? limit : ''
                slug += ','
                slug += ceiling !== undefined ? ceiling : ''
                slug += ','
                slug += currency
                var data = {
                    type: 'rent_budget',
                    slug: slug,
                    currency: currency,
                    value: value,
                    sort_value: sort_value || 0
                }
                return $http.post('/api/1/enum/add', data, {errorMessage: true})
            },
            editRentBudget: function (id, limit, ceiling, currency, value, sort_value) {
                var slug = 'rent_budget:'
                slug += limit !== undefined ? limit : ''
                slug += ','
                slug += ceiling !== undefined ? ceiling : ''
                slug += ','
                slug += currency
                var data = {
                    type: 'rent_budget',
                    slug: slug,
                    currency: currency,
                    value: value,
                    sort_value: sort_value || 0
                }
                return $http.post('/api/1/enum/' + id + '/edit', data, {errorMessage: true})
            },
            remove: function (id, config) {
                return $http.post('/api/1/enum/' + id + '/remove', {mode: 'clean'}, config)
            },
            deprecate: function (id, config) {
                return $http.post('/api/1/enum/' + id + '/deprecate', null,  config)
            },
            check: function (id, config) {
                return $http.post('/api/1/enum/' + id + '/check', null, config)
            },
            getHesaUniversityList: function (country) {
                var data = {
                    country: country
                }
                return $http.post('/api/1/hesa_university/search', data)
            },
            editHesaUniversity: function (id, city) {
                return $http.post('/api/1/hesa_university/' + id + '/edit', {city: city}, {errorMessage: true})
            }
        }

    }

    angular.module('app').factory('enumApi', enumApi)
})()
