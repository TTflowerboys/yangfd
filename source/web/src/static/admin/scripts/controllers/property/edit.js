/**
 * Created by Michael on 14/9/17.
 */

(function () {

    function ctrlPropertyEdit($scope, $state, api, $stateParams, misc, growl) {

        $scope.item = {}

        var itemFromParent = misc.findById($scope.$parent.list, $stateParams.id)


        if (itemFromParent) {
            onGetItem(itemFromParent)
        } else {
            api.getOne($stateParams.id, {errorMessage: true})
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

        api.getAll({
            params: {
                target_property_id: $stateParams.id,
                status: 'draft,not translated,translating,not reviewed,rejected'
            }, errorMessage: true
        })
            .success(function (data) {
                var res = data.val.content
                if (!_.isEmpty(res)) {
                    $scope.draftId = res[0].id
                }
            })

        var currentItem

        function onGetItem(item) {
            currentItem = item
            var editItem = angular.copy(item)
            if (!_.isEmpty(editItem.property_type)) {
                $scope.propertyType = editItem.property_type.slug
                editItem.property_type = editItem.property_type.id
            }
            if (!_.isEmpty(editItem.intention)) {
                var temp = []
                angular.forEach(editItem.intention, function (value, key) {
                    temp.push(value.id)
                })
                editItem.intention = temp
            }
            if (!_.isEmpty(editItem.investment_type)) {
                var temp1 = []
                angular.forEach(editItem.investment_type, function (value, key) {
                    temp1.push(value.id)
                })
                editItem.investment_type = temp1
            }
            if (!_.isEmpty(editItem.equity_type)) {
                editItem.equity_type = editItem.equity_type.id
            }
            if (!_.isEmpty(editItem.decorative_style)) {
                editItem.decorative_style = editItem.decorative_style.id
            }
            if (!_.isEmpty(editItem.property_price_type)) {
                $scope.propertyPriceType = editItem.property_price_type.slug
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
                angular.extend(currentItem, data.val)
                $state.go('^')
            })['finally'](function () {
                $scope.loading = false
            })
        }

        $scope.submitForReview = function ($event, form) {
            $scope.item.status = 'not reviewed'
            $scope.submit($event, form)
        }

        $scope.makeStatusToDraft = function () {
            api.update({status: 'draft', id: $scope.item.id}, {
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

    angular.module('app').controller('ctrlPropertyEdit', ctrlPropertyEdit)

})()

