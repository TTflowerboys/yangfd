/**
 * Created by Michael on 14/9/20.
 */
angular.module('app')
    .filter('supportTicketStatusName', function (misc, supportTicketStatus) {
        return function (status) {
            if (!status) {
                return
            }

            var found = misc.findBy(supportTicketStatus, 'value', status)

            return found ? found.name : ''
        }
    })