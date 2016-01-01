/**
 * Created by zhou on 14-12-2.
 */
angular.module('app')
    .filter('email_tag', function (misc, email_tag) {
        return function (value) {
            if (!value) {
                return
            }

            var found = misc.findBy(email_tag, 'value', value)

            return found ? found.name : ''
        }
    })
