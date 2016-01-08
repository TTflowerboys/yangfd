
angular.module('app')
    .filter('boolean', function () {
        return function(input) {
            return input === true ? 'yes' : (input === false ? 'no' : '')
        }
    })