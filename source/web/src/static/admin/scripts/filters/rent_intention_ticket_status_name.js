/**
 * Created by Michael on 14/9/20.
 */
angular.module('app')
    .filter('rentIntentionTicketStatusName', function (misc, rentIntentionTicketStatus) {
        return function (status) {
            if (!status) {
                return
            }

            var found = misc.findBy(rentIntentionTicketStatus, 'value', status)

            return found ? found.name : ''
        }
    })