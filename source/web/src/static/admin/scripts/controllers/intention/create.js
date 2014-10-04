/* Created by frank on 14-8-15. */


(function () {

    function ctrlIntentionCreate($scope, $state, api, $http, $rootScope, i18nLanguages, misc) {

        $scope.item = {}

        $scope.submit = function ($event, form) {
            $event.preventDefault()
            $scope.submitted = true
            $scope.loading = true
            $scope.item = misc.cleanTempData($scope.item)
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

    angular.module('app').controller('ctrlIntentionCreate', ctrlIntentionCreate)

})()

