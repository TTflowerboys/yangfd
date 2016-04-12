angular.module('app')
    .filter('removeProtocol', function ($rootScope) {
        return function (text) {
            return text ? text.replace(/http[s]?:\/\//, '') : ''
        }
    })