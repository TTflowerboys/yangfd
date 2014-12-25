/**
 * Created by zhou on 14-12-11.
 */
(function () {

    function ctrlWeixinMenu($scope, $state, api, misc) {

        $scope.item = {}

        $scope.getMenu = function () {
            api.getAll().success(function (data) {
                $scope.item = data.val
                if ($scope.item.button) {
                    for (var i in $scope.item.button) {
                        var btn = $scope.item.button[i]
                        if (btn.sub_button) {
                            for (var j in btn.sub_button) {
                                delete btn.sub_button[j].sub_button
                            }
                        }
                    }
                }
            })
        }

        $scope.submit = function ($event, form) {
            $event.preventDefault()
            $scope.submitted = true
            $scope.loading = true
            $scope.item = misc.cleanTempData($scope.item)
            var data = angular.toJson($scope.item)
            api.create(data, {
                successMessage: 'Update successfully',
                errorMessage: 'Update failed'
            }).success(function () {
                $scope.getMenu()
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

        $scope.onRemoveButton = function (index) {
            $scope.item.button.splice(index, 1)
        }

        $scope.addSubButton = function (btn) {
            if (!btn.sub_button) {
                btn.sub_button = []
            }
            btn.sub_button.push({type: 'view'})
        }

        $scope.onRemoveSubButton = function (btn, index) {
            btn.sub_button.splice(index, 1)
        }

        $scope.removeMenu = function () {
            api.remove().success(function (data) {
                $scope.getMenu()
            })
        }

        $scope.getMenu()
    }

    angular.module('app').controller('ctrlWeixinMenu', ctrlWeixinMenu)

})()

