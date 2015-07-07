/**
 * Created by Michael on 14/11/14.
 */
(function () {

    function ctrlReportCreate($scope, $state, api, misc) {

        $scope.item = {}

        $scope.submit = function ($event, form) {
            $event.preventDefault()
            $scope.submitted = true
            $scope.loading = true
            $scope.item = misc.cleanI18nEmptyUnit($scope.item)
            if($scope.item.zipcode_index){
                $scope.item.zipcode_index = $scope.item.zipcode_index.toUpperCase()
            }
            api.create($scope.item, {
                successMessage: 'Update successfully',
                errorMessage: true
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

    angular.module('app').controller('ctrlReportCreate', ctrlReportCreate)

})()

