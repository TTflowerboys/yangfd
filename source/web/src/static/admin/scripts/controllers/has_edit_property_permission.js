/**
 * Created by Michael on 14/11/13.
 */
(function () {

    function ctrlHasEditPropertyPermission($scope, userApi) {

        $scope.hasEditPermission = function (status) {
            if (status === 'not reviewed') {
                return false
            }
            var user = userApi.getCurrentUser()
            if (!user || !user.role || user.role.length <= 0) {
                return false
            }
            var permissionList = ['admin', 'jr_admin', 'operation']
            for (var i = 0, length = permissionList.length; i < length; i += 1) {
                if (_.contains(user.role, permissionList[i].trim())) {
                    return true
                }
            }
            if (status === 'draft' || status === 'not translated' || status === 'translating') {
                if (_.contains(user.role, 'jr_operation')) {
                    return true
                }
            }
            return false
        }
    }

    angular.module('app').controller('ctrlHasEditPropertyPermission', ctrlHasEditPropertyPermission)

})()

