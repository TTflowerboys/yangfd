/**
 * Created by Arnold on 15/7/02.
 */

(function () {

    function ctrlRentEdit($scope, $state, api,propertyApi, $stateParams, misc, growl) {

        $scope.item = {}

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
            if (!_.isEmpty(editItem.rent)) {
                var temp = []
                angular.forEach(editItem.rent, function (value, key) {

                    temp.push(value.id)
                })
                editItem.rent = temp
            }
            $scope.itemOrigin = editItem
            $scope.item = angular.copy($scope.itemOrigin)
        }


        $scope.submit = function ($event, form) {
            $event.preventDefault()
            $scope.submitted = true
            var rentChanged = {
                title: $scope.item.title,
                description:$scope.item.description
            }
            var changed = JSON.parse(angular.toJson($scope.item))
            changed = misc.cleanTempData(changed)
            changed = misc.cleanI18nEmptyUnit(changed)
            changed = misc.getChangedI18nAttributes(changed, $scope.itemOrigin)
            if (_.isEmpty(changed)&&_.isEmpty(rentChanged)) {
                growl.addWarnMessage('Nothing to update')
                return
            }
            $scope.loading = true

            if (!_.isEmpty(changed.property)) {
                propertyApi.update($scope.item.property.id, changed.property, {
                    successMessage: 'Update successfully',
                    errorMessage: 'Update failed'
                }).success(function (data) {
                    //TODO
                    angular.extend(currentItem.property, data.val)
                })
            }

            api.update($stateParams.id, rentChanged, {
                successMessage: 'Update successfully',
                errorMessage: 'Update failed'
            }).success(function (data) {
                angular.extend(currentItem, data.val)
                $state.go('^')
                //location.reload()
            })['finally'](function () {
                $scope.loading = false
            })

        }
    }

    angular.module('app').controller('ctrlRentEdit', ctrlRentEdit)

})()

