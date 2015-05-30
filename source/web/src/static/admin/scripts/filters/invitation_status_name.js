/**
 * Created by Arnold on 15/5/30.
 */
angular.module('app')
    .filter('invitationStatusName', function (misc, invitationStatus) {
        return function (status) {
            if (!status) {
                return
            }

            var found = misc.findBy(invitationStatus, 'value', status)

            return found ? found.name : ''
        }
    })