/**
 * Created by zhou on 14-12-2.
 */
angular.module('app')
    .filter('propertyKeyName', function (misc, propertyItems) {
        return function (status) {
            if (!status) {
                return
            }

            var found = misc.findBy(propertyItems, 'value', status)

            return found ? found.name : ''
        }
    })