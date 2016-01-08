angular.module('app')
    .filter('values', function () {
        return function (key, obj) {
            return _.isObject(obj) ? obj[key] : key
        }
    })