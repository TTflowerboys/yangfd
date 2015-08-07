angular.module('app')
    .filter('showBedroom', function () {
        return function (roomcount) {
            return roomcount === 0 ? 'studio' : roomcount
        }
    })