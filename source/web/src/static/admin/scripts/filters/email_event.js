/**
 * Created by zhou on 14-12-2.
 */
angular.module('app')
    .filter('email_event', function (misc, email_event) {
        return function (value) {
            if (!value) {
                return
            }

            var found = misc.findBy(email_event, 'value', value)

            return found ? found.name : ''
        }
    })
