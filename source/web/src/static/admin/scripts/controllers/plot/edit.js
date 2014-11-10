/**
 * Created by Michael on 14/10/27.
 */
(function () {

    function ctrlPlotEdit($scope, $state, api, $stateParams, misc, growl) {

        $scope.item = {}

        var itemFromParent = misc.findById($scope.$parent.list, $stateParams.id)

        if (itemFromParent) {
            onGetItem(itemFromParent)
        } else {
            api.getOne($stateParams.id, {params: {_i18n: 'disabled'}, errorMessage: true})
                .success(function (data) {
                    onGetItem(data.val)
                })
        }

        var currentItem

        function onGetItem(item) {
            currentItem = item
            var editItem = angular.copy(item)
            if (!_.isEmpty(editItem.investment_type)) {
                var temp1 = []
                angular.forEach(editItem.investment_type, function (value, key) {
                    temp1.push(value.id)
                })
                editItem.investment_type = temp1
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
            api.update(angular.extend(changed, {id: $stateParams.id}), {
                params: {_i18n: 'disabled'},
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

    angular.module('app').controller('ctrlPlotEdit', ctrlPlotEdit)

})()

