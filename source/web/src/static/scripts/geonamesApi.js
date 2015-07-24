function GeonamesApi () {
    var url = '/api/1/geonames/search'
    var cache = {}
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
    this.getNeighborhood = function (callback, reject) {
        if(!cache.neighborhood) {
            $.betterPost('/api/1/maponics_neighborhood/search')
                .done(function (val) {
                    cache.neighborhood = val
                    callback.call(null, val)
                })
                .fail(function (ret) {
                    if(reject && typeof reject === 'function') {
                        reject(ret)
                    }
                })
        } else {
            callback.call(null, cache.neighborhood)
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
}
window.geonamesApi = new GeonamesApi()