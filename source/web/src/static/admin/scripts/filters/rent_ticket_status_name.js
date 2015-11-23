/**
 * Created by Michael on 15/11/23.
 */
angular.module('app')
    .filter('rentTicketStatusName', function (misc, rentTicketStatus) {
        return function (status) {
            if (!status) {
                return
            }

            var found = misc.findBy(rentTicketStatus, 'value', status)

            return found ? found.name : ''
        }
    })