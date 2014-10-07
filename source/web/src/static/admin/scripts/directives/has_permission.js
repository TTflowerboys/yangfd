/* Created by frank on 14-9-5. */
angular.module('app')
    .directive('hasPermission', function (userApi) {
        return {
            link: function (scope, element, attrs) {

                var permissionList = attrs.hasPermission.split(/[, ]/)
                element.hide();

                var user = userApi.getCurrentUser()
                if (!user || !user.role || user.role.length <= 0) {
                    return
                }

                for (var i = 0, length = permissionList.length; i < length; i += 1) {
                    if (_.contains(user.role, permissionList[i].trim())) {
                        element.show()
                        break
                    }
                }

            }
        }
    })
