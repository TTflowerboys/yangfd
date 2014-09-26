/* Created by frank on 14-8-15. */


(function () {

    function ctrlEnums($scope, $rootScope, $state, $stateParams, api) {
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

            var temp = [ $scope.item.tempI18n, $scope.item.tempValue]
            $scope.item.tempValues.push(temp)
            $scope.item.tempI18n = null
            $scope.item.tempValue = null
        }
        $scope.addI18nEnum = function ($event, form) {

            $scope.item.value = _.object($scope.item.tempValues)
            api.addEnum($scope.item.type, $scope.item.value)
                .success(function () {
                    $scope.item.value = null
                    $scope.item.tempValues = null
                })
        }
        $scope.editI18nEnum = function ($event, form) {

            $scope.item.value = _.object($scope.item.tempValues)
            api.editEnum($stateParams.id, $scope.item.type, $scope.item.value)
                .success(function () {
                    $state.go('^')
                })
        }
        $scope.addCountry = function ($event, form) {

            $scope.item.value = _.object($scope.item.tempValues)
            api.addCountry($scope.item.slug, $scope.item.value)
                .success(function () {
                    $scope.item.slug = null
                    $scope.item.value = null
                    $scope.item.tempValues = null
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
                    $scope.item.value = null
                    $scope.item.tempValues = null
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
                    $scope.item.limit = null
                    $scope.item.ceiling = null
                    $scope.item.value = null
                    $scope.item.tempValues = null
                })
        }
        $scope.editBudget = function ($event, form) {

            $scope.item.value = _.object($scope.item.tempValues)
            api.editBudget($stateParams.id, $scope.item.limit, $scope.item.ceiling, $scope.item.currency, $scope.item.value)
                .success(function () {
                    $state.go('^')
                })
        }
    }

    angular.module('app').controller('ctrlEnums', ctrlEnums)

})()

