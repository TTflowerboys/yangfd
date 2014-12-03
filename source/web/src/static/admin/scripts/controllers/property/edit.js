/**
 * Created by Michael on 14/9/17.
 */

(function () {

    function ctrlPropertyEdit($scope, $state, api, $stateParams, misc, growl, $window, propertyStatus, userApi,
                              propertySellingStatus, propertyReviewStatus, $rootScope) {

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
                                $scope.targetItem = angular.copy(data.val)
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
            $scope.item.status = 'selling'
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

        var user = userApi.getCurrentUser()
        if (!user) {
            return
        }
        var need_init = true
        var roles = user.role
        $scope.$watch('item.status', function (newValue) {
            if (need_init && newValue) {
                need_init = false
                if (_.contains(roles, 'admin') || _.contains(roles, 'jr_admin') || _.contains(roles,
                        'operation')) {
                    if (newValue === 'not reviewed') {
                        $scope.propertyStatus = propertyReviewStatus
                    } else if (newValue === 'selling' || newValue === 'hidden' || newValue === 'sold out') {
                        $scope.propertyStatus = propertySellingStatus
                    } else {
                        $scope.propertyStatus = propertyStatus.filter(function (one, index, array) {
                            return _.contains(['draft', 'not translated', 'translating', 'not reviewed'],
                                    one.value) || one.value === $scope.item.status
                        })
                    }
                    return
                }
                if (_.contains(roles, 'jr_operation')) {
                    if (newValue === 'draft' || newValue === 'not translated' ||
                        newValue === 'translating' || newValue === 'not reviewed' || newValue === 'rejected') {
                        $scope.propertyStatus = propertyStatus.filter(function (one, index, array) {
                            return _.contains(['draft', 'not translated', 'translating', 'not reviewed'],
                                    one.value) || one.value === $scope.item.status
                        })
                        return
                    }
                }
                $scope.propertyStatus = propertyStatus.filter(function (one, index, array) {
                    return one.value === $scope.item.status
                })
            }
        })
        $scope.onReset = function ($event, data) {
            //console.log($scope.targetItem.get(data))
        }

        $scope.onRemoveDelete = function (index) {
            $scope.item.unset_fields.splice(index, 1)
            if ($scope.item.unset_fields.length === 0) {
                $scope.item.unset_fields = undefined
            }
            updateUnsetFieldsHeight()
        }

        $scope.onDelete = function ($event, data) {
            if (!$scope.item.unset_fields) {
                $scope.item.unset_fields = []
            }
            for (var index in $scope.item.unset_fields) {
                var field = $scope.item.unset_fields[index]
                if (field === data) {
                    growl.addErrorMessage($rootScope.renderHtml('already exists'), {enableHtml: true})
                    return
                }
            }
            $scope.item.unset_fields.push(data)
            updateUnsetFieldsHeight()
        }

        $rootScope.$on('ANGULAR_DRAG_START', function ($event, channel) {
            setTimeout(function () {
                $scope.$evalAsync(function () {
                    if (!$scope.item.unset_fields) {
                        $scope.item.unset_fields = []

                    }
                });
            }, 0);
        })

        $rootScope.$on('ANGULAR_DRAG_END', function ($event, channel) {
            setTimeout(function () {
                $scope.$evalAsync(function () {
                    if ($scope.item.unset_fields.length === 0) {
                        $scope.item.unset_fields = undefined
                    }
                });
            }, 0);
        })

        var updateUnsetFieldsHeight = function () {
            setTimeout(function () {
                $('#unset_fields_blank').height(function (n, c) {
                    return $('#unset_fields').height() + 20
                });
            }, 100);
        }
        updateUnsetFieldsHeight()
    }

    angular.module('app').controller('ctrlPropertyEdit', ctrlPropertyEdit)

})()

