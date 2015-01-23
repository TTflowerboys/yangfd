/**
 * Created by Michael on 14/10/27.
 */
angular.module('app')
    .filter('orderStatusName', function (misc, orderStatus) {
        return function (status) {
            if (!status) {
                return
            }

            var found = misc.findBy(orderStatus, 'value', status)

            return found ? found.name : ''
        }
    })