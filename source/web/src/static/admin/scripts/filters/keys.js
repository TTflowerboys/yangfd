angular.module('app')
    .filter('keys', function () {
        return function (list, key) {
            return key ? _.map(list, function (obj) {
                return obj[key]
            }) : item
        }
    })