/**
 * Created by zhou on 15-1-13.
 */


(function () {

    function ctrlCrowdfundingEdit($scope, $state, api, $stateParams, misc, growl, $window) {
        $scope.item = {}

        var itemFromParent = misc.findById($scope.$parent.list, $stateParams.id)


        if (itemFromParent) {
            onGetItem(itemFromParent)
        } else {
            api.getOne($stateParams.id, {errorMessage: true})
                .success(function (data) {
                    var res = data.val
                    if (res.target_item_id) {
                        api.getOne(res.target_item_id, {errorMessage: true})
                            .success(function (data) {
                                onGetTargetItem(data.val)
                                res = angular.extend(data.val, res)
                                onGetItem(res)
                            })
                    } else {
                        onGetItem(res)
                    }
                })
        }

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
            if (!_.isEmpty(editItem.country)) {
                editItem.country = editItem.country.id
            }
            if (!_.isEmpty(editItem.city)) {
                editItem.city = editItem.city.id
            }
            $scope.itemOrigin = editItem
            $scope.item = angular.copy($scope.itemOrigin)
        }

        function onGetTargetItem(item) {
            var editTargetItem = angular.copy(item)
            if (!_.isEmpty(editTargetItem.property_type)) {
                editTargetItem.property_type = editTargetItem.property_type.id
            }
            if (!_.isEmpty(editTargetItem.intention)) {
                var temp = []
                angular.forEach(editTargetItem.intention, function (value, key) {
                    temp.push(value.id)
                })
                editTargetItem.intention = temp
            }
            if (!_.isEmpty(editTargetItem.investment_type)) {
                var temp1 = []
                angular.forEach(editTargetItem.investment_type, function (value, key) {
                    temp1.push(value.id)
                })
                editTargetItem.investment_type = temp1
            }
            if (!_.isEmpty(editTargetItem.country)) {
                editTargetItem.country = editTargetItem.country.id
            }
            if (!_.isEmpty(editTargetItem.city)) {
                editTargetItem.city = editTargetItem.city.id
            }
            $scope.targetItem = editTargetItem
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
            if (changed.zipcode) {
                changed.zipcode_index = changed.zipcode.substring(0, 3).toUpperCase()
            }
            $scope.loading = true
            api.update(angular.extend(changed, {id: $stateParams.id}), {
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

        $scope.submitForReview = function ($event, form) {
            $scope.item.status = 'not reviewed'
            $scope.submit($event, form)
        }

        $scope.makeStatusToDraft = function () {
            api.update({status: 'draft', id: $stateParams.id}, {
                successMessage: 'Update successfully',
                errorMessage: 'Update failed'
            }).success(function (data) {
                angular.extend(currentItem, data.val)
                $state.go('^')
            })['finally'](function () {
                $scope.loading = false
            })
        }

        $scope.submitForAccept = function ($event, form) {
            $scope.item.status = 'new'
            $scope.submit($event, form)
        }

        $scope.submitForReject = function ($event, form) {
            $scope.item.status = 'rejected'
            $scope.submit($event, form)
        }

        $scope.submitForPreview = function ($event, form) {
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
                successMessage: 'Update successfully',
                errorMessage: 'Update failed'
            }).success(function (data) {
                $window.open('property/' + $stateParams.id, '_blank')
            })['finally'](function () {
                $scope.loading = false
            })
        }

    }

    angular.module('app').controller('ctrlCrowdfundingEdit', ctrlCrowdfundingEdit)

})()

