/**
 * Created by Michael on 14/9/23.
 */

(function () {

    function ctrlNewsEdit($scope, $state, api, $stateParams, misc, growl) {
        $scope.api = api

        var itemFromParent = misc.findById($scope.$parent.list, $stateParams.id)


        if (itemFromParent) {
            onGetItem(itemFromParent)
        } else {
            api.getOne($stateParams.id, {errorMessage: true})
                .success(function (data) {
                    onGetItem(data.val)
                })
        }

        var currentItem

        function onGetItem(item) {
            currentItem = item
            var editItem = angular.copy(item)
            if (!_.isEmpty(editItem.country)) {
                editItem.country = editItem.country.code
            }
            if (!_.isEmpty(editItem.city)) {
                editItem.city = editItem.city.id
            }
            if (!_.isEmpty(editItem.category)) {
                var temp = []
                angular.forEach(editItem.category, function (value, key) {
                    temp.push(value.id)
                })
                editItem.category = temp
            }
            $scope.itemOrigin = editItem
            $scope.item = angular.copy($scope.itemOrigin)
        }


        $scope.submit = function ($event, form) {
            $event.preventDefault()
            $scope.submitted = true
            var changed = misc.getChangedI18nAttributes($scope.item, $scope.itemOrigin)
            if (!changed) {
                growl.addWarnMessage('Nothing to update')
                return
            }

            $scope.loading = true

            api.update(angular.extend(changed, {id: $stateParams.id}), {
                successMessage: 'Update successfully',
                errorMessage: 'Update failed'
            }).success(function (data) {
                angular.extend(currentItem, data.val)
                $state.go('^')
            })['finally'](function () {
                $scope.loading = false
            })
        }


    }

    angular.module('app').controller('ctrlNewsEdit', ctrlNewsEdit)

})()

