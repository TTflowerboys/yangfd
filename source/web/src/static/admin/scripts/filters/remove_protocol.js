angular.module('app')
    .filter('removeProtocol', function ($rootScope) {
        return function (text) {
            return text.replace(/http[s]?:\/\//, '')
        }
    })