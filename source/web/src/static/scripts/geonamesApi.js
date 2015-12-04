function GeonamesApi () {
    var url = '/api/1/geonames/search'
    var cache = {
        neighborhood: {},
        school: {},
        postcode: {}
    }
    this.getAdmin = function (config, callback, reject) {
        if(!cache[$.param(config)]) {
            $.betterPost(url, config)
                .done(function (val) {
                    cache[$.param(config)] = val
                    callback.call(null, val)
                })
                .fail(function (ret) {
                    if(reject && typeof reject === 'function') {
                        reject(ret)
                    }
                })
        } else {
            callback.call(null, cache[$.param(config)])
        }

    }
    this.getCity = function (country, callback, reject) {
        this.getAdmin({
            country: country,
            feature_code: 'city'
        }, callback, reject)
    }
    this.getNeighborhood = function (config, callback, reject) {
        config = _.extend({
            include_parent: true
        }, config)
        if(!cache.neighborhood[$.param(config)]) {
            $.betterPost('/api/1/maponics_neighborhood/search', config)
                .done(function (val) {
                    var valSorted = _.sortBy(val, 'name')
                    cache.neighborhood[$.param(config)] = valSorted
                    callback.call(null, valSorted)
                })
                .fail(function (ret) {
                    if(reject && typeof reject === 'function') {
                        reject(ret)
                    }
                })
        } else {
            callback.call(null, cache.neighborhood[$.param(config)])
        }
    }
    this.getSchool = function (params, callback, reject) {
        if(!cache.school[$.param(params)]) {
            $.betterPost('/api/1/hesa_university/search', params)
                .done(function (val) {
                    cache.school[$.param(params)] = val
                    callback.call(null, val)
                })
                .fail(function (ret) {
                    if(reject && typeof reject === 'function') {
                        reject(ret)
                    }
                })
        } else {
            callback.call(null, cache.school[$.param(params)])
        }
    }
    this.getAdmin1 = function (country, callback, reject) {
        this.getAdmin({
            country: country,
            feature_code: 'ADM1'
        }, callback, reject)
    }
    this.getAdmin2 = function (country, admin1, callback, reject) {
        this.getAdmin({
            country: country,
            admin1: admin1,
            feature_code: 'ADM2'
        }, callback, reject)
    }
    this.getCityByLocation = function (country, latitude, longitude, callback, reject) {
        this.getAdmin({
            search_range: 50000,
            country: country,
            latitude: latitude,
            longitude: longitude,
            feature_code: 'city'
        }, callback, reject)
    }
    this.getCountry = function (postcode) {
        return window.Q.promise(function (resolve, reject) {
            if(!cache.postcode[postcode]) {
                $.betterPost('/api/1/postcode/search', {postcode_index: postcode})
                    .done(function (val) {
                        cache.postcode[postcode] = val
                        resolve(val)
                    })
                    .fail(function (ret) {
                        reject(ret)
                    })
            } else {
                resolve(cache.postcode[postcode])
            }
        })
    }
}
window.geonamesApi = new GeonamesApi()