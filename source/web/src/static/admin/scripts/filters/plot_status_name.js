/**
 * Created by Michael on 14/10/27.
 */
angular.module('app')
    .filter('plotStatusName', function (misc, plotStatus) {
        return function (status) {
            if (!status) {
                return
            }

            var found = misc.findBy(plotStatus, 'value', status)

            return found ? found.name : ''
        }
    })