/**
 * Created by Michael on 14/9/17.
 */

(function () {

    function ctrlIntentionEdit($scope, $state, api, $stateParams, enumApi, $rootScope, i18nLanguages, misc, growl) {

        $scope.item = {}

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
            if (!_.isEmpty(editItem.budget)) {
                editItem.budget = editItem.budget.id
            }
            if (!_.isEmpty(editItem.intention)) {
                editItem.intention = editItem.intention[0].id//TODO
            }
            if (!_.isEmpty(editItem.equity_type)) {
                editItem.equity_type = editItem.equity_type.id
            }
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
            var changed = JSON.parse(angular.toJson($scope.item))
            changed = misc.cleanTempData(changed)
            changed = misc.cleanI18nEmptyUnit(changed)
            changed = misc.getChangedI18nAttributes(changed, $scope.itemOrigin)
            if (_.isEmpty(changed)) {
                growl.addWarnMessage('Nothing to update')
                return
            }
            $scope.loading = true
            api.update(angular.extend(changed, {id: $scope.item.id}), {
                successMessage: 'Update successfully',
                errorMessage: 'Update failed'
            }).success(function (data) {
                if (itemFromParent) {
                    itemFromParent = data.val
                }
                $scope.$parent.refreshList()
                onGetItem(data.val)
            })['finally'](function () {
                $scope.loading = false
            })
        }
    }

    angular.module('app').controller('ctrlIntentionEdit', ctrlIntentionEdit)

})()

