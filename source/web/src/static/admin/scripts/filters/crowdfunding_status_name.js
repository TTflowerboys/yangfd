/**
 * Created by zhou on 15-1-13.
 */

angular.module('app')
    .filter('crowdfundingStatusName', function (misc, crowdfundingStatus) {
        return function (status) {
            if (!status) {
                return
            }

            var found = misc.findBy(crowdfundingStatus, 'value', status)

            return found ? found.name : ''
        }
    })