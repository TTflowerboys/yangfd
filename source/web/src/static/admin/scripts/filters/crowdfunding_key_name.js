/**
 * Created by zhou on 14-12-2.
 */
angular.module('app')
    .filter('crowdfundingKeyName', function (misc, crowdfundingItems) {
        return function (status) {
            if (!status) {
                return
            }

            var found = misc.findBy(crowdfundingItems, 'value', status)

            return found ? found.name : ''
        }
    })