/**
 * Created by Michael on 14/9/17.
 */

(function () {

    function ctrlPropertyEdit($scope, $state, api, $stateParams, misc, growl, $window, propertyStatus, userApi,
                              propertySellingStatus, propertyReviewStatus, $rootScope, $filter, houseProperty, notHouseProperty) {

        var delayer = new misc.Delayer({
            task: function () {
                autoUpdate()
            },
            delay: 2 * 60 * 1000
        })

        //issue #6880 房产编辑里当修改了“房产类型”时，将不同类型数据差异的部分设为unset fields
        function unsetFieldsByropertyType (item) {
            //todo 找出怎么样在这里使用$scope.propertyType
            switch($('[name=property_type]').attr('data-propertytype')) {
                case 'house':
                case 'student_housing':
                case 'new_property':
                    item.unset_fields = _.uniq((item.unset_fields || []).concat(notHouseProperty))
                    break
                case 'apartment':
                    item.unset_fields = _.uniq((item.unset_fields || []).concat(houseProperty))
                    break
            }

            return item
        }

        function getSubmitItem(item) {
            var submitItem = JSON.parse(angular.toJson(item))
            submitItem = misc.cleanTempData(submitItem)
            submitItem = misc.cleanI18nEmptyUnit(submitItem)
            return unsetFieldsByropertyType(submitItem)
        }

        function autoUpdate() {
            if ($state.current.controller !== 'ctrlPropertyEdit') {
                $scope.cancelDelayer()
                return
            }
            //Property item used for submit, use angular toJson to remove angular-specific tags
            $scope.submitItem = getSubmitItem($scope.item)
            update(misc.getChangedI18nAttributes($scope.submitItem, $scope.lastItem))
            delayer.update()
        }

        function update(param) {
            if (_.isEmpty(param)) {
                return
            }
            api.update($stateParams.id, param, {
                successMessage: 'Update successfully',
                errorMessage: 'Update failed'
            }).success(function (data) {
                if (_.isEmpty(data.val.id)) {
                    $stateParams.id = data.val
                } else {
                    angular.extend(currentItem, data.val)
                    $stateParams.id = data.val.id
                }
                if ($scope.submitted) {
                    $scope.cancelDelayer()
                    $state.go('^')
                } else {
                    $scope.lastItem = $scope.submitItem
                }
            })['finally'](function () {
                $scope.loading = false
            })
        }

        $scope.cancelDelayer = function () {
            delayer.cancel()
        }

        $scope.resetData = function () {
            $scope.submitItem = $scope.itemOrigin
            $scope.submitItem = misc.cleanTempData($scope.submitItem)
            $scope.submitItem = misc.cleanI18nEmptyUnit($scope.submitItem)
            update(misc.getChangedI18nAttributes($scope.submitItem, $scope.lastItem))
            $scope.cancelDelayer()
        }

        $scope.item = {}
        $scope.lastItem = $scope.lastItem || {}
        $scope.itemOrigin = $scope.itemOrigin || {}
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
                                onGetTargetItem(data.val)
                                res = angular.extend(data.val, res)
                                onGetItem(res)
                            })
                    } else {
                        onGetItem(res)
                    }
                })
        }

        //api.getAll({
        //    params: {
        //        target_property_id: $stateParams.id,
        //        status: 'draft,not translated,translating,not reviewed,rejected'
        //    }, errorMessage: true
        //})
        //    .success(function (data) {
        //        var res = data.val.content
        //        if (!_.isEmpty(res)) {
        //            $scope.draftId = res[0].id
        //        }
        //    })

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
                editItem.country = editItem.country.code
            }
            if (!_.isEmpty(editItem.city)) {
                editItem.cityName = editItem.city.name
                editItem.city = editItem.city.id
            }
            if(_.isEmpty(editItem.zipcode_index)) {
                editItem.zipcode_index = editItem.zipcode.trim().slice(0, editItem.zipcode.trim().length - 3)
            }
            editItem.unset_fields = []
            //Property item which is the original one when enter the edit page, used for rollback
            $scope.itemOrigin = editItem
            //Property item which is currently editing, aka, used for two-way binding
            $scope.item = angular.copy($scope.itemOrigin)
            //Property item which is latest submitted to server when auto saving
            $scope.lastItem = angular.copy($scope.itemOrigin)
        }

        // Used for get target item for draft property
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
            if (!_.isEmpty(editTargetItem.equity_type)) {
                editTargetItem.equity_type = editTargetItem.equity_type.id
            }
            if (!_.isEmpty(editTargetItem.decorative_style)) {
                editTargetItem.decorative_style = editTargetItem.decorative_style.id
            }
            if (!_.isEmpty(editTargetItem.property_price_type)) {
                $scope.propertyPriceType = editTargetItem.property_price_type.slug
                editTargetItem.property_price_type = editTargetItem.property_price_type.id
            }
            if (!_.isEmpty(editTargetItem.facing_direction)) {
                editTargetItem.facing_direction = editTargetItem.facing_direction.id
            }
            if (!_.isEmpty(editTargetItem.country)) {
                editTargetItem.country = editTargetItem.country.code
            }
            if (!_.isEmpty(editTargetItem.city)) {
                editTargetItem.cityName = editTargetItem.city.name
                editTargetItem.city = editTargetItem.city.id
            }
            $scope.targetItem = editTargetItem
        }

        $scope.submit = function ($event, form) {
            $event.preventDefault()
            $scope.submitted = true
            var submitItem = getSubmitItem($scope.item)
            var changed = misc.getChangedI18nAttributes(submitItem, $scope.lastItem)
            if (_.isEmpty(changed)) {
                growl.addWarnMessage('没有修改或已自动保存')
                return
            }
            $scope.loading = true
            api.update($stateParams.id, changed, {
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
            api.update($stateParams.id, {status: 'draft'}, {
                successMessage: 'Update successfully',
                errorMessage: 'Update failed'
            }).success(function (data) {
                angular.extend(currentItem, data.val)
                $state.go('^')
            })['finally'](function () {
                $scope.loading = false
            })
        }

        $scope.submitForPreview = function ($event, form) {
            $scope.submitted = true
            var submitItem = getSubmitItem($scope.item)
            var changed = misc.getChangedI18nAttributes(submitItem, $scope.lastItem)
            if (_.isEmpty(changed)) {
                $window.open('property/' + $stateParams.id, '_blank')
                return
            }
            $scope.loading = true
            api.update($stateParams.id, changed, {
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
            var dontHaveKey = true
            Object.keys($scope.targetItem).forEach(function (key) {
                if (key === data) {
                    dontHaveKey = false
                    if (angular.equals($scope.item[key], $scope.targetItem[key])) {
                        growl.addErrorMessage($rootScope.renderHtml($filter('propertyKeyName')(key) + i18n('未修改')),
                            {enableHtml: true})
                    } else {
                        growl.addSuccessMessage($rootScope.renderHtml($filter('propertyKeyName')(key) + i18n('已恢复')),
                            {enableHtml: true})
                        $scope.item[key] = $scope.targetItem[key];
                    }
                }
            });
            if (dontHaveKey) {
                growl.addErrorMessage($rootScope.renderHtml(i18n('原始数据中不存在：') + $filter('propertyKeyName')(data)),
                    {enableHtml: true})
            }
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

