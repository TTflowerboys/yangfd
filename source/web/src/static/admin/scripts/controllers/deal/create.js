(function () {

    function ctrlDealCreate($scope, $state, api, $stateParams) {

        $scope.api = api

        $scope.item = {}
        $scope.item.display = false
        $scope.item.deal_type = 'free'
        $scope.submit = function ($event) {
            $event.preventDefault()
            $scope.submitted = true

            $scope.loading = true
            api.create($stateParams.id, $scope.item, {
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

        $scope.updateExisting = function () {
            api.addRole($scope.item.id, $scope.item.role, {
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

    angular.module('app').controller('ctrlDealCreate', ctrlDealCreate)

})()

