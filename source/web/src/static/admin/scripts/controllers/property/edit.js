/**
 * Created by Michael on 14/9/17.
 */

(function () {

    function ctrlPropertyEdit($scope, $state, api, $stateParams, enumApi, $rootScope, i18nLanguages, misc, growl) {

        $scope.item = {}

        var itemFromParent = misc.findById($scope.$parent.list, $stateParams.id)


        if (itemFromParent) {
            onGetItem(itemFromParent)
        } else {
            api.getOne($stateParams.id)
                .success(function (data) {
                    var res = data.val
                    if (res.target_property_id) {
                        api.getOne(res.target_property_id, {errorMessage: true})
                            .success(function (data) {
                                res = angular.extend(data.val, res)
                                onGetItem(res)
                            })
                    } else {
                        onGetItem(res)
                    }
                })
        }


        function onGetItem(item) {
            var editItem = angular.copy(item)
            if (!_.isEmpty(editItem.property_type)) {
                editItem.property_type = editItem.property_type.id
            }
            if (!_.isEmpty(editItem.intention)) {
                editItem.intention = editItem.intention.id
            }
            if (!_.isEmpty(editItem.equity_type)) {
                editItem.equity_type = editItem.equity_type.id
            }
            if (!_.isEmpty(editItem.decorative_style)) {
                editItem.decorative_style = editItem.decorative_style.id
            }
            if (!_.isEmpty(editItem.property_price_type)) {
                editItem.property_price_type = editItem.property_price_type.id
            }
            if (!_.isEmpty(editItem.facing_direction)) {
                editItem.facing_direction = editItem.facing_direction.id
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
                onGetItem(data.val)
            })['finally'](function () {
                $scope.loading = false
            })
        }
    }

    angular.module('app').controller('ctrlPropertyEdit', ctrlPropertyEdit)

})()

