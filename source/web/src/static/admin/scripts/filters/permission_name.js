/* Created by frank on 14-8-28. */
angular.module('app')
    .filter('permissionName', function (misc, permissions) {
        return function (permission) {
            if (!permission) { return }

            var found = misc.findBy(permissions, 'value', permission)

            return found ? found.name : ''
        }
    })

