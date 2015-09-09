
angular.module('app')
    .filter('countryName', function () {
        return function (country) {
            if(country && country.code) {
                return window.team.countryMap[country.code]
            } else {
                return ''
            }
        }
    })