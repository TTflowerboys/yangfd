/**
 * Created by zhou on 14-12-11.
 */
(function () {

    function ctrlWeixinMenu($scope, $state, api, misc) {

        $scope.item = {}
        api.getMenu().success(function (data) {
        })

        $scope.submit = function ($event, form) {
            $event.preventDefault()
            $scope.submitted = true
            $scope.loading = true
            $scope.item = misc.cleanTempData($scope.item)
            api.updateMenu($scope.item, {
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
        $scope.addButton = function () {
            if (!$scope.item.button) {
                $scope.item.button = []
            }
            $scope.item.button.push({})
        }

        $scope.addButton = function (index) {
            if (!$scope.item.button) {
                $scope.item.button = []
            }
            $scope.item.button.push({})
        }

        $scope.onRemoveButton = function (index) {
            $scope.item.button.splice(index, 1)
        }

        $scope.addSubButton = function (btn) {
            if (!btn.sub_button) {
                btn.sub_button = []
            }
            btn.sub_button.push({})
        }

        $scope.onRemoveSubButton = function (btn, index) {
            btn.sub_button.splice(index, 1)
        }
    }

    angular.module('app').controller('ctrlWeixinMenu', ctrlWeixinMenu)

})()

