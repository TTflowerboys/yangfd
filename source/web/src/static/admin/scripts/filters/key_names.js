/**
 * Created by levy on 15-6-9.
 */
angular.module('app')
    .filter('keyName', function (misc) {
        return function (status, items) {
            if (!status || !items) {
                return
            }

            var found = misc.findBy(items, 'value', status)

            return found ? found.name : ''
        }
    })