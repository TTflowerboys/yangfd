/**
 * Created by Michael on 14/9/23.
 */

(function () {

    function ctrlNewsEdit($scope, $state, api, $stateParams, $upload, misc, growl) {
        $scope.api = api

        var itemFromParent = misc.findById($scope.$parent.list, $stateParams.id)


        if (itemFromParent) {
            onGetItem(itemFromParent)
        } else {
            api.getOne($stateParams.id)
                .success(function (data) {
                    onGetItem(data.val)
                })
        }


        function onGetItem(item) {
            var editItem = angular.copy(item)
            if (!_.isEmpty(editItem.country)) {
                editItem.country = editItem.country.id
            }
            if (!_.isEmpty(editItem.city)) {
                editItem.city = editItem.city.id
            }
            $scope.itemOrigin = editItem
            $scope.item = angular.copy($scope.itemOrigin)
        }


        $scope.submit = function ($event, form) {
            $event.preventDefault()
            $scope.submitted = true
            console.log($scope.item)
            console.log($scope.itemOrigin)
            var changed = misc.getChangedI18nAttributes($scope.item, $scope.itemOrigin)
            if (!changed) {
                growl.addWarnMessage('Nothing to update')
                return
            }

            $scope.loading = true

            api.update(angular.extend(changed, {id: $scope.item.id}), {
                successMessage: 'Update successfully',
                errorMessage: 'Update failed'
            }).success(function () {
                angular.extend($scope.itemOrigin, changed)
            })['finally'](function () {
                $scope.loading = false
            })
        }


    }

    angular.module('app').controller('ctrlNewsEdit', ctrlNewsEdit)

})()

