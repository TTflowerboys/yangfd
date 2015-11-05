/* Created by frank on 14-8-15. */


(function () {

    function ctrlEnums($scope, $rootScope, $state, $stateParams, api, fctModal, geonamesApi) {
        $scope.enums = []
        $scope.item = {}
        $scope.status = 'new'

        $scope.getEnums = function (status) {
            for (var i = 0; i < $rootScope.enumTypes.length; i += 1) {
                getEnumByIndex(i, status)
            }
        }
        function getEnumByIndex(index, status) {
            api.getEnumsByType($rootScope.enumTypes[index].value, status)
                .success(function (data) {
                    $scope.enums[index] = data.val || {}
                })
        }

        $scope.getEditEnumItem = function () {
            api.getI18nEnumsById($stateParams.id)
                .success(function (data) {
                    $scope.item = data.val || {}
                    $scope.item.tempValues = _.pairs($scope.item.value)
                    for (var i = $scope.item.tempValues.length - 1; i >= 0; i -= 1) {
                        if ($scope.item.tempValues[i][0] === '_i18n') {
                            $scope.item.tempValues.splice(i, 1)
                        } else {
                            $scope.onAddLanguage($scope.item.tempValues[i][0])
                        }
                    }
                })
        }
        $scope.getEditCity = function () {
            api.getI18nEnumsById($stateParams.id)
                .success(function (data) {
                    $scope.item = data.val || {}
                    $scope.item.tempValues = _.pairs($scope.item.value)
                    for (var i = $scope.item.tempValues.length - 1; i >= 0; i -= 1) {
                        if ($scope.item.tempValues[i][0] === '_i18n') {
                            $scope.item.tempValues.splice(i, 1)
                        } else {
                            $scope.onAddLanguage($scope.item.tempValues[i][0])
                        }
                    }
                    $scope.item.country = $scope.item.country.id
                })
        }
        $scope.getBudget = function (status) {
            api.getEnumsByType('budget', status)
                .success(function (data) {
                    $scope.budget = data.val
                })
        }
        $scope.getBuildingArea = function (status) {
            api.getEnumsByType('building_area', status)
                .success(function (data) {
                    $scope.building_area = data.val
                })
        }
        $scope.getCity = function (status) {
            api.getEnumsByType('city', status)
                .success(function (data) {
                    $scope.cities = data.val
                })
        }
        $scope.getCountry = function (status) {
            api.getEnumsByType('country', status)
                .success(function (data) {
                    $scope.countries = data.val
                })
        }
        $scope.getRentBudget = function (status) {
            api.getEnumsByType('rent_budget', status)
                .success(function (data) {
                    $scope.rent_budget = data.val
                })
        }
        $scope.getRentBudgetItem = function (status) {
            api.getEnumsByType('rent_budget_item', status)
                .success(function (data) {
                    $scope.rent_budget_item = data.val
                })
        }
        $scope.getState = function (status) {
            api.getEnumsByType('state', status)
                .success(function (data) {
                    $scope.states = data.val
                })
        }
        $scope.addI18nValue = function () {
            if (!$scope.item.tempValues) {
                $scope.item.tempValues = []
            }

            var temp = [$scope.item.tempI18n, $scope.item.tempValue]
            $scope.item.tempValues.push(temp)
            $scope.item.tempI18n = undefined
            $scope.item.tempValue = undefined
        }
        $scope.addI18nEnum = function ($event, form) {
            if ($scope.item.value === undefined &&
                $scope.item.tempValues === undefined) {
                return
            }

            $scope.item.value = _.object($scope.item.tempValues)
            api.addEnum($scope.item.type, $scope.item.value, $scope.item.slug, $scope.item.sort_value, $scope.item.image, $scope.item.currency)
                .success(function () {
                    $scope.item.value = undefined
                    $scope.item.tempValues = undefined
                })
        }
        $scope.editI18nEnum = function ($event, form) {

            $scope.item.value = _.object($scope.item.tempValues)
            api.editEnum($stateParams.id, $scope.item.type, $scope.item.value, $scope.item.slug, $scope.item.sort_value, $scope.item.image, $scope.item.currency)
                .success(function () {
                    $state.go('^',{},{reload:true})
                    //location.reload()
                })
        }
        $scope.addCountry = function ($event, form) {
            if ($scope.item.slug === undefined &&
                $scope.item.value === undefined &&
                $scope.item.tempValues === undefined) {
                return
            }
            $scope.item.value = _.object($scope.item.tempValues)
            api.addCountry($scope.item.slug, $scope.item.value, $scope.item.sort_value)
                .success(function () {
                    $scope.item.slug = undefined
                    $scope.item.value = undefined
                    $scope.item.tempValues = undefined
                })
        }
        $scope.editCountry = function ($event, form) {

            $scope.item.value = _.object($scope.item.tempValues)
            api.editCountry($stateParams.id, $scope.item.slug, $scope.item.value, $scope.item.sort_value)
                .success(function () {
                    $state.go('^',{},{reload:true})
                    //location.reload()
                })
        }
        $scope.addState = function ($event, form) {
            if ($scope.item.value === undefined &&
                $scope.item.tempValues === undefined) {
                return
            }
            $scope.item.value = _.object($scope.item.tempValues)
            api.addState($scope.item.country, $scope.item.value, $scope.item.sort_value)
                .success(function () {
                    $scope.item.value = undefined
                    $scope.item.tempValues = undefined
                })
        }
        $scope.editState = function ($event, form) {

            $scope.item.value = _.object($scope.item.tempValues)
            api.editState($stateParams.id, $scope.item.country, $scope.item.value, $scope.item.sort_value)
                .success(function () {
                    $state.go('^',{},{reload:true})
                    //location.reload()
                })
        }
        $scope.addCity = function ($event, form) {
            if ($scope.item.value === undefined &&
                $scope.item.tempValues === undefined) {
                return
            }
            $scope.item.value = _.object($scope.item.tempValues)
            api.addCity($scope.item.country, $scope.item.value, $scope.item.sort_value)
                .success(function () {
                    $scope.item.value = undefined
                    $scope.item.tempValues = undefined
                })
        }
        $scope.editCity = function ($event, form) {

            $scope.item.value = _.object($scope.item.tempValues)
            api.editCity($stateParams.id, $scope.item.country, $scope.item.value, $scope.item.sort_value)
                .success(function () {
                    $state.go('^',{},{reload:true})
                    //location.reload()
                })
        }
        $scope.removeI18nValue = function (index) {
            $scope.item.tempValues.splice(index, 1)
        }
        $scope.getEditBudget = function () {
            api.getI18nEnumsById($stateParams.id)
                .success(function (data) {
                    $scope.item = data.val || {}
                    $scope.item.tempValues = _.pairs($scope.item.value)
                    for (var i = $scope.item.tempValues.length - 1; i >= 0; i -= 1) {
                        if ($scope.item.tempValues[i][0] === '_i18n') {
                            $scope.item.tempValues.splice(i, 1)
                        } else {
                            $scope.onAddLanguage($scope.item.tempValues[i][0])
                        }
                    }
                    var index0 = $scope.item.slug.indexOf(':') + 1
                    var index1 = $scope.item.slug.indexOf(',')
                    var index2 = $scope.item.slug.lastIndexOf(',')
                    $scope.item.limit = !isNaN(parseInt($scope.item.slug.substring(index0, index1), 10)) ? parseInt($scope.item.slug.substring(index0, index1), 10) : undefined
                    $scope.item.ceiling = !isNaN(parseInt($scope.item.slug.substring(index1 + 1, index2), 10)) ? parseInt($scope.item.slug.substring(index1 + 1, index2), 10) : undefined
                })
        }
        $scope.addBudget = function ($event, form) {
            if ($scope.item.limit === undefined &&
                $scope.item.ceiling === undefined &&
                $scope.item.value === undefined &&
                $scope.item.tempValues === undefined) {
                return
            }
            $scope.item.value = _.object($scope.item.tempValues)
            api.addBudget($scope.item.limit, $scope.item.ceiling, $scope.item.currency, $scope.item.value, $scope.item.sort_value)
                .success(function () {
                    $scope.item.limit = undefined
                    $scope.item.ceiling = undefined
                    $scope.item.value = undefined
                    $scope.item.tempValues = undefined
                })
        }
        $scope.editBudget = function ($event, form) {

            $scope.item.value = _.object($scope.item.tempValues)
            api.editBudget($stateParams.id, $scope.item.limit, $scope.item.ceiling, $scope.item.currency,
                $scope.item.value, $scope.item.sort_value)
                .success(function () {
                    $state.go('^',{},{reload:true})
                    //location.reload()
                })
        }
        $scope.getHesaUniversityList = function (country) {
            api.getHesaUniversityList(country).success(function (data) {
                $scope.hesaUniversityList = data.val
            })
            geonamesApi.getAll({
                params: {
                    country: country,
                    feature_code: 'city'
                }
            }).success(function (data) {
                $scope.cityList = data.val
            })
        }

        $scope.editCityOfHesaUniversity = function (item) {
            item.edit = true
        }
        $scope.submitCityOfHesaUniversity = function (item) {
            api.editHesaUniversity(item.id, item.citySelected)
                .success(function (data) {
                    angular.extend(item,data.val)
                    item.edit = false
                })
        }
        $scope.getEditBuildingArea = function () {
            api.getI18nEnumsById($stateParams.id)
                .success(function (data) {
                    $scope.item = data.val || {}
                    $scope.item.tempValues = _.pairs($scope.item.value)
                    for (var i = $scope.item.tempValues.length - 1; i >= 0; i -= 1) {
                        if ($scope.item.tempValues[i][0] === '_i18n') {
                            $scope.item.tempValues.splice(i, 1)
                        } else {
                            $scope.onAddLanguage($scope.item.tempValues[i][0])
                        }
                    }
                    var index0 = $scope.item.slug.indexOf(':') + 1
                    var index1 = $scope.item.slug.indexOf(',')
                    var index2 = $scope.item.slug.lastIndexOf(',')
                    $scope.item.limit = !isNaN(parseInt($scope.item.slug.substring(index0, index1), 10)) ? parseInt($scope.item.slug.substring(index0, index1), 10) : undefined
                    $scope.item.ceiling = !isNaN(parseInt($scope.item.slug.substring(index1 + 1, index2), 10)) ? parseInt($scope.item.slug.substring(index1 + 1, index2), 10) : undefined
                    $scope.item.area = $scope.item.slug.substring(index2 + 1).replace('_**_', ' ** ')
                })
        }
        $scope.addBuildingArea = function ($event, form) {
            if ($scope.item.limit === undefined &&
                $scope.item.ceiling === undefined &&
                $scope.item.value === undefined &&
                $scope.item.tempValues === undefined) {
                return
            }
            $scope.item.value = _.object($scope.item.tempValues)
            api.addBuildingArea($scope.item.limit, $scope.item.ceiling, $scope.item.area.replace(' ** ', '_**_'),
                $scope.item.value, $scope.item.sort_value)
                .success(function () {
                    $scope.item.limit = undefined
                    $scope.item.ceiling = undefined
                    $scope.item.value = undefined
                    $scope.item.tempValues = undefined
                })
        }
        $scope.editBuildingArea = function ($event, form) {

            $scope.item.value = _.object($scope.item.tempValues)
            api.editBuildingArea($stateParams.id, $scope.item.limit, $scope.item.ceiling,
                $scope.item.area.replace(' ** ', '_**_'),
                $scope.item.value, $scope.item.sort_value)
                .success(function () {
                    $state.go('^',{},{reload:true})
                    //location.reload()
                })
        }
        $scope.getIntentionList = function (status) {
            api.getEnumsByType('intention', status).success(function (data) {
                $scope.intentionList = data.val
            })
        }
        $scope.getRoomCountList = function (type, status) {
            api.getEnumsByType(type, status).success(function (data) {
                $scope.roomCount = data.val
            })
        }
        $scope.addIntention = function ($event, form) {
            if ($scope.item.image === undefined &&
                $scope.item.value === undefined &&
                $scope.item.description === undefined &&
                $scope.item.tempValues === undefined &&
                $scope.item.slug === undefined) {
                return
            }
            var valueArray = []
            var descriptionArray = []
            for (var i = 0; i < $scope.item.tempValues.length; i += 1) {
                var tempValueArray = [$scope.item.tempValues[i][0], $scope.item.tempValues[i][1]]
                valueArray.push(tempValueArray)
                var tempDescriptionArray = [$scope.item.tempValues[i][0], $scope.item.tempValues[i][2]]
                descriptionArray.push(tempDescriptionArray)
            }
            $scope.item.value = _.object(valueArray)
            $scope.item.description = _.object(descriptionArray)
            api.addIntention($scope.item.value, $scope.item.description, $scope.item.slug, $scope.item.sort_value)
                .success(function () {
                    $scope.item.image = undefined
                    $scope.item.value = undefined
                    $scope.item.description = undefined
                    $scope.item.tempValues = undefined
                    $scope.item.slug = undefined
                })
        }
        $scope.getEditIntention = function () {
            api.getI18nEnumsById($stateParams.id)
                .success(function (data) {
                    $scope.item = data.val || {}
                    $scope.item.tempValues = _.pairs($scope.item.value)
                    for (var i = $scope.item.tempValues.length - 1; i >= 0; i -= 1) {
                        if ($scope.item.tempValues[i][0] === '_i18n') {
                            $scope.item.tempValues.splice(i, 1)
                        } else {
                            $scope.onAddLanguage($scope.item.tempValues[i][0])
                        }
                    }
                    if (_.isEmpty($scope.item.description)) {
                        return
                    }
                    for (var index = 0; index < $scope.item.tempValues.length; index += 1) {
                        $scope.item.tempValues[index][2] = $scope.item.description[$scope.item.tempValues[index][0]]
                    }
                })
        }
        $scope.editIntention = function ($event, form) {
            var valueArray = []
            var descriptionArray = []
            for (var i = 0; i < $scope.item.tempValues.length; i += 1) {
                var tempValueArray = [$scope.item.tempValues[i][0], $scope.item.tempValues[i][1]]
                valueArray.push(tempValueArray)
                var tempDescriptionArray = [$scope.item.tempValues[i][0], $scope.item.tempValues[i][2]]
                descriptionArray.push(tempDescriptionArray)
            }
            $scope.item.value = _.object(valueArray)
            $scope.item.description = _.object(descriptionArray)
            api.editIntention($stateParams.id, $scope.item.value, $scope.item.description, $scope.item.slug, $scope.item.sort_value)
                .success(function () {
                    $state.go('^',{},{reload:true})
                    //location.reload()
                })
        }
        $scope.addIntentionValue = function () {
            if (!$scope.item.tempValues) {
                $scope.item.tempValues = []
            }
            var temp = [$scope.item.tempI18n, $scope.item.tempValue, $scope.item.tempDescription]
            $scope.item.tempValues.push(temp)
            $scope.item.tempI18n = undefined
            $scope.item.tempValue = undefined
            $scope.item.tempDescription = undefined
        }
        $scope.onRemove = function (item) {
            api.check(item.id, {errorMessage: true}).success(function (data) {
                var res = data.val
                if (res) {
                    var txt = []
                    if (res.item.length > 0) {
                        txt.push(i18n('众筹') + res.item.length + i18n('条'))
                    }
                    if (res.news.length > 0) {
                        txt.push(i18n('房产资讯') + res.news.length + i18n('条'))
                    }
                    if (res.property.length > 0) {
                        txt.push(i18n('房产') + res.property.length + i18n('条'))
                    }
                    if (res.ticket.length > 0) {
                        txt.push(i18n('投资意向单') + res.ticket.length + i18n('条'))
                    }
                    if (res.user.length > 0) {
                        txt.push(i18n('用户') + res.user.length + i18n('条'))
                    }
                    var count = res.item.length + res.news.length + res.property.length + res.ticket.length + res.user.length
                    var alertText = ''
                    if (count > 0) {
                        alertText += i18n('此数据有') + count + i18n('条引用,其中')
                        for (var index in txt) {
                            alertText += txt[index]
                            if (index < txt.length - 1) {
                                alertText += i18n('，')
                            } else {
                                alertText += i18n('。')
                            }
                        }
                    }
                    alertText += '确认删除？'
                    fctModal.show(alertText, undefined, function () {
                        api.remove(item.id, {errorMessage: true}).success(function () {
                            $state.transitionTo($state.current, angular.copy($stateParams), { reload: true, inherit: true, notify: true });
                        })
                    })
                }
            })
        }
        $scope.onDeprecate = function (item) {
            api.check(item.id, {errorMessage: true}).success(function (data) {
                var res = data.val
                if (res) {
                    var txt = []
                    if (res.item.length > 0) {
                        txt.push(i18n('众筹') + res.item.length + i18n('条'))
                    }
                    if (res.news.length > 0) {
                        txt.push(i18n('房产资讯') + res.news.length + i18n('条'))
                    }
                    if (res.property.length > 0) {
                        txt.push(i18n('房产') + res.property.length + i18n('条'))
                    }
                    if (res.ticket.length > 0) {
                        txt.push(i18n('投资意向单') + res.ticket.length + i18n('条'))
                    }
                    if (res.user.length > 0) {
                        txt.push(i18n('用户') + res.user.length + i18n('条'))
                    }
                    var count = res.item.length + res.news.length + res.property.length + res.ticket.length + res.user.length
                    var alertText = ''
                    if (count > 0) {
                        alertText += i18n('此数据有') + count + i18n('条引用,其中')
                        for (var index in txt) {
                            alertText += txt[index]
                            if (index < txt.length - 1) {
                                alertText += i18n('，')
                            } else {
                                alertText += i18n('。')
                            }
                        }
                    }
                    alertText += '确认弃用？'
                    fctModal.show(alertText, undefined, function () {
                        api.deprecate(item.id, {errorMessage: true}).success(function () {
                            $state.transitionTo($state.current, angular.copy($stateParams), { reload: true, inherit: true, notify: true });
                        })
                    })
                }
            })
        }
        $scope.getEditRoomCount = function () {
            api.getI18nEnumsById($stateParams.id)
                .success(function (data) {
                    $scope.item = data.val || {}
                    $scope.item.tempValues = _.pairs($scope.item.value)
                    for (var i = $scope.item.tempValues.length - 1; i >= 0; i -= 1) {
                        if ($scope.item.tempValues[i][0] === '_i18n') {
                            $scope.item.tempValues.splice(i, 1)
                        } else {
                            $scope.onAddLanguage($scope.item.tempValues[i][0])
                        }
                    }
                    var index0 = $scope.item.slug.indexOf(':') + 1
                    var index1 = $scope.item.slug.indexOf(',')
                    $scope.item.limit = !isNaN(parseInt($scope.item.slug.substring(index0, index1), 10)) ? parseInt($scope.item.slug.substring(index0, index1), 10) : undefined
                    $scope.item.ceiling = !isNaN(parseInt($scope.item.slug.substring(index1 + 1), 10)) ? parseInt($scope.item.slug.substring(index1 + 1), 10) : undefined
                })
        }
        $scope.addRoomCount = function ($event, form) {
            if ($scope.item.limit === undefined &&
                $scope.item.ceiling === undefined &&
                $scope.item.value === undefined &&
                $scope.item.tempValues === undefined) {
                return
            }
            $scope.item.value = _.object($scope.item.tempValues)
            api.addRoomCount($scope.item.limit, $scope.item.ceiling, $scope.item.type, $scope.item.value, $scope.item.sort_value)
                .success(function () {
                    $scope.item.limit = undefined
                    $scope.item.ceiling = undefined
                    $scope.item.value = undefined
                    $scope.item.tempValues = undefined
                })
        }
        $scope.editRoomCount = function ($event, form) {

            $scope.item.value = _.object($scope.item.tempValues)
            api.editRoomCount($stateParams.id, $scope.item.limit, $scope.item.ceiling, $scope.item.type,
                $scope.item.value, $scope.item.sort_value)
                .success(function () {
                    $state.go('^',{},{reload:true})
                    //location.reload()
                })
        }
        $scope.getEditRentBudget = function () {
            api.getI18nEnumsById($stateParams.id)
                .success(function (data) {
                    $scope.item = data.val || {}
                    $scope.item.tempValues = _.pairs($scope.item.value)
                    for (var i = $scope.item.tempValues.length - 1; i >= 0; i -= 1) {
                        if ($scope.item.tempValues[i][0] === '_i18n') {
                            $scope.item.tempValues.splice(i, 1)
                        } else {
                            $scope.onAddLanguage($scope.item.tempValues[i][0])
                        }
                    }
                    var index0 = $scope.item.slug.indexOf(':') + 1
                    var index1 = $scope.item.slug.indexOf(',')
                    var index2 = $scope.item.slug.lastIndexOf(',')
                    $scope.item.limit = !isNaN(parseInt($scope.item.slug.substring(index0, index1), 10)) ? parseInt($scope.item.slug.substring(index0, index1), 10) : undefined
                    $scope.item.ceiling = !isNaN(parseInt($scope.item.slug.substring(index1 + 1, index2), 10)) ? parseInt($scope.item.slug.substring(index1 + 1, index2), 10) : undefined
                })
        }
        $scope.addRentBudget = function ($event, form) {
            if ($scope.item.limit === undefined &&
                $scope.item.ceiling === undefined &&
                $scope.item.value === undefined &&
                $scope.item.tempValues === undefined) {
                return
            }
            $scope.item.value = _.object($scope.item.tempValues)
            api.addRentBudget($scope.item.limit, $scope.item.ceiling, $scope.item.currency, $scope.item.value, $scope.item.sort_value)
                .success(function () {
                    $scope.item.limit = undefined
                    $scope.item.ceiling = undefined
                    $scope.item.value = undefined
                    $scope.item.tempValues = undefined
                })
        }
        $scope.editRentBudget = function ($event, form) {

            $scope.item.value = _.object($scope.item.tempValues)
            api.editRentBudget($stateParams.id, $scope.item.limit, $scope.item.ceiling, $scope.item.currency,
                $scope.item.value, $scope.item.sort_value)
                .success(function () {
                    $state.go('^',{},{reload:true})
                    //location.reload()
                })
        }
        $scope.getEditRentBudgetItem = function () {
            api.getI18nEnumsById($stateParams.id)
                .success(function (data) {
                    $scope.item = data.val || {}
                    $scope.item.tempValues = _.pairs($scope.item.value)
                    for (var i = $scope.item.tempValues.length - 1; i >= 0; i -= 1) {
                        if ($scope.item.tempValues[i][0] === '_i18n') {
                            $scope.item.tempValues.splice(i, 1)
                        } else {
                            $scope.onAddLanguage($scope.item.tempValues[i][0])
                        }
                    }
                    $scope.item.number = parseInt($scope.item.slug.split(':')[0])
                })
        }
        $scope.addRentBudgetItem = function ($event, form) {
            $scope.item.value = _.object($scope.item.tempValues)
            api.addRentBudgetItem($scope.item.number.toString() + ':' + $scope.item.currency, $scope.item.currency, $scope.item.value, $scope.item.sort_value)
                .success(function () {
                    $scope.item.value = undefined
                    $scope.item.tempValues = undefined
                })
        }
        $scope.editRentBudgetItem = function ($event, form) {

            $scope.item.value = _.object($scope.item.tempValues)
            api.editRentBudgetItem($stateParams.id, $scope.item.number.toString() + ':' + $scope.item.currency, $scope.item.currency,
                $scope.item.value, $scope.item.sort_value)
                .success(function () {
                    $state.go('^',{},{reload:true})
                    //location.reload()
                })
        }
    }

    angular.module('app').controller('ctrlEnums', ctrlEnums)

})()

