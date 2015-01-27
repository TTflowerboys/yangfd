/* Created by frank on 14-8-15. */


(function () {

    function ctrlEnums($scope, $rootScope, $state, $stateParams, api, fctModal) {
        $scope.enums = []
        $scope.item = {}

        $scope.getEnums = function () {
            for (var i = 0; i < $rootScope.enumTypes.length; i += 1) {
                getEnumByIndex(i)
            }
        }
        function getEnumByIndex(index) {
            api.getEnumsByType($rootScope.enumTypes[index].value)
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

            $scope.item.value = _.object($scope.item.tempValues)
            api.addEnum($scope.item.type, $scope.item.value, $scope.item.slug)
                .success(function () {
                    $scope.item.value = undefined
                    $scope.item.tempValues = undefined
                })
        }
        $scope.editI18nEnum = function ($event, form) {

            $scope.item.value = _.object($scope.item.tempValues)
            api.editEnum($stateParams.id, $scope.item.type, $scope.item.value, $scope.item.slug)
                .success(function () {
                    $state.go('^')
                })
        }
        $scope.addCountry = function ($event, form) {

            $scope.item.value = _.object($scope.item.tempValues)
            api.addCountry($scope.item.slug, $scope.item.value)
                .success(function () {
                    $scope.item.slug = undefined
                    $scope.item.value = undefined
                    $scope.item.tempValues = undefined
                })
        }
        $scope.editCountry = function ($event, form) {

            $scope.item.value = _.object($scope.item.tempValues)
            api.editCountry($stateParams.id, $scope.item.slug, $scope.item.value)
                .success(function () {
                    $state.go('^')
                })
        }
        $scope.addCity = function ($event, form) {

            $scope.item.value = _.object($scope.item.tempValues)
            api.addCity($scope.item.country, $scope.item.value)
                .success(function () {
                    $scope.item.value = undefined
                    $scope.item.tempValues = undefined
                })
        }
        $scope.editCity = function ($event, form) {

            $scope.item.value = _.object($scope.item.tempValues)
            api.editCity($stateParams.id, $scope.item.country, $scope.item.value)
                .success(function () {
                    $state.go('^')
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
                    var index1 = $scope.item.slug.indexOf(',')
                    var index2 = $scope.item.slug.lastIndexOf(',')
                    $scope.item.limit = parseInt($scope.item.slug.substring(7, index1), 10)
                    $scope.item.ceiling = parseInt($scope.item.slug.substring(index1 + 1, index2), 10)
                })
        }
        $scope.addBudget = function ($event, form) {

            $scope.item.value = _.object($scope.item.tempValues)
            api.addBudget($scope.item.limit, $scope.item.ceiling, $scope.item.currency, $scope.item.value)
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
                $scope.item.value)
                .success(function () {
                    $state.go('^')
                })
        }
        $scope.getIntentionList = function () {
            api.getEnumsByType('intention').success(function (data) {
                $scope.intentionList = data.val
            })
        }
        $scope.addIntention = function ($event, form) {
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
            api.addIntention($scope.item.value, $scope.item.description)
                .success(function () {
                    $scope.item.image = undefined
                    $scope.item.value = undefined
                    $scope.item.description = undefined
                    $scope.item.tempValues = undefined
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
            api.editIntention($stateParams.id, $scope.item.value, $scope.item.description)
                .success(function () {
                    $state.go('^')
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
                    if(res.item.length > 0){
                        txt.push( i18n('众筹') + res.item.length + i18n('条'))
                    }
                    if( res.news.length>0){
                        txt.push(i18n('房产资讯') + res.news.length + i18n('条'))
                    }
                    if( res.property.length>0){
                        txt.push(i18n('房产') + res.property.length + i18n('条'))
                    }
                    if( res.ticket.length>0){
                        txt.push(i18n('投资意向单') + res.ticket.length + i18n('条'))
                    }
                    if( res.user.length>0){
                        txt.push(i18n('用户') + res.user.length + i18n('条'))
                    }
                    var count = res.item.length + res.news.length + res.property.length + res.ticket.length + res.user.length
                    var alertText = ''
                    if (count > 0) {
                        alertText += i18n('此数据有') + count + i18n('条引用,其中')
                        for(var index in txt){
                            alertText+=txt[index]
                            if(index<txt.length-1){
                                alertText+=i18n('，')
                            }else{
                                alertText+=i18n('。')
                            }
                        }
                    }
                    alertText += '确认删除？'
                    fctModal.show(alertText, undefined, function () {
                        api.remove(item.id, {errorMessage: true}).success(function () {
                            location.reload()
                        })
                    })
                }
            })
        }
    }

    angular.module('app').controller('ctrlEnums', ctrlEnums)

})()

