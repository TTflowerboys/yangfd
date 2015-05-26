/**
 * Created by Michael on 14/11/14.
 */
(function () {

    function ctrlReportEdit($scope, $state, api, misc, $stateParams, growl) {

        $scope.item = {}

        var itemFromParent = misc.findById($scope.$parent.list, $stateParams.id)

        if (itemFromParent) {
            onGetItem(itemFromParent)
        } else {
            api.getOne($stateParams.id, {params: {_i18n: 'disabled'}, errorMessage: true})
                .success(function (data) {
                    var res = data.val
                    onGetItem(res)
                })
        }
        var currentItem

        function onGetItem(item) {
            currentItem = item
            var editItem = angular.copy(item)
            if (!_.isEmpty(editItem.schools)) {
                var temp = []
                angular.forEach(editItem.schools, function (value, key) {
                    temp.push({
                        name: value.name,
                        type: value.type.id,
                        grade: value.grade.id,
                        ranking: value.ranking
                    })
                })
                editItem.schools = temp
            }
            if (!_.isEmpty(editItem.facilities)) {
                var temp1 = []
                angular.forEach(editItem.facilities, function (value, key) {
                    temp1.push({
                        name: value.name,
                        type: value.type.id,
                        address: value.address,
                        distance: value.distance
                    })
                })
                editItem.facilities = temp1
            }
            if (!_.isEmpty(editItem.country)) {
                editItem.country = editItem.country.code
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
            changed = misc.cleanI18nEmptyUnit(changed)
            changed = misc.getChangedI18nAttributes(changed, $scope.itemOrigin)
            if (_.isEmpty(changed)) {
                growl.addWarnMessage('Nothing to update')
                return
            }
            if (changed.zipcode_index) {
                changed.zipcode_index = changed.zipcode_index.toUpperCase()
            }
            $scope.loading = true
            api.update(angular.extend(changed, {id: $stateParams.id}), {
                params: {_i18n: 'disabled'},
                successMessage: 'Update successfully',
                errorMessage: 'Update failed'
            }).success(function (data) {
                angular.extend(currentItem, data.val)
                $state.go('^')
            }).error(function () {
                if ($scope.item.status !== $scope.itemOrigin.status) {
                    $scope.item.status = $scope.itemOrigin.status
                }
            })['finally'](function () {
                $scope.loading = false
            })
        }
    }

    angular.module('app').controller('ctrlReportEdit', ctrlReportEdit)

})()

