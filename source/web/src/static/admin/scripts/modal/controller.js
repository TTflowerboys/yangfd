/* Created by frank on 14-8-19. */
(function () {

    function ctrlModal($scope, title, content, $modalInstance) {

        $scope.title = title || 'Information'
        $scope.content = content || ''

        $scope.ok = function () {
            $modalInstance.close();
        };

        $scope.cancel = function () {
            $modalInstance.dismiss();
        };
    }

    angular.module('app').controller('ctrlModal', ctrlModal)

})()
