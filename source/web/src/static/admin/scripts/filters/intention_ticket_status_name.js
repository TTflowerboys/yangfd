/**
 * Created by Michael on 14/9/20.
 */
angular.module('app')
    .filter('intentionTicketStatusName', function (misc, intentionTicketStatus) {
        return function (status) {
            if (!status) {
                return
            }

            var found = misc.findBy(intentionTicketStatus, 'value', status)

            return found ? found.name : ''
        }
    })