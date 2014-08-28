/* Created by frank on 14-8-28. */
angular.module('app')
    .filter('permissionCanAdd', function (misc, permissions) {
        return function (roles) {
            if (!roles) { return []}
            return _.filter(permissions, function (permission) {
                return !_.contains(roles, permission.value)
            })
        }
    })


