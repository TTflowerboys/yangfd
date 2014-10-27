/**
 * Created by Michael on 14/10/27.
 */
(function () {

    function ctrlHasPermission($scope, userApi) {
        $scope.hasPermission = function (data) {

            var permissionList = data.split(/[, ]/)

            var user = userApi.getCurrentUser()
            if (!user || !user.role || user.role.length <= 0) {
                return false
            }

            for (var i = 0, length = permissionList.length; i < length; i += 1) {
                if (_.contains(user.role, permissionList[i].trim())) {
                    return true
                }
            }

        }
    }

    angular.module('app').controller('ctrlHasPermission', ctrlHasPermission)

})()

