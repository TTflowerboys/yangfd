/* Created by frank on 14-8-15. */


(function () {

    function ctrlCreateAdmin($scope, $state, api) {


        $scope.item = {}

        $scope.submit = function ($event, form) {
            $event.preventDefault()
            $scope.submitted = true
            if (form.$invalid) { return }
            $scope.loading = true
            api.create($scope.item, {
                successMessage: 'Update successfully',
                errorMessage: 'Update failed'
            }).success(function () {
                if ($scope.$parent.currentPageNumber === 1) {
                    $scope.$parent.refreshList()
                }
                $state.go('^')
            })['finally'](function () {
                $scope.loading = false
            })
        }


    }

    angular.module('app').controller('ctrlCreateAdmin', ctrlCreateAdmin)

})()

