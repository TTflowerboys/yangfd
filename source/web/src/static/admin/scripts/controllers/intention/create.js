/* Created by frank on 14-8-15. */


(function () {

    function ctrlIntentionCreate($scope, $state, api, $http, $rootScope, i18nLanguages, misc) {

        $scope.item = {}

        $scope.submit = function ($event, form) {
            $event.preventDefault()
            $scope.submitted = true
            $scope.loading = true
            $scope.item = misc.cleanTempData($scope.item)
            api.create($scope.item, {
                successMessage: 'Update successfully',
                errorMessage: 'Update failed'
            }).success(function () {
                if ($scope.$parent.currentPageNumber === 1) {
                    $scope.$parent.refreshList()
                }
                $state.go('^')
            })['finally'](function () {
                $scope.loading = false
            })
        }

        $scope.checkPhone = function () {
            checkPhone($scope.item.phoneCountry, $scope.item.phoneNumber).success(function (data) {
                $scope.item.phone = data.val
                getUserByPhone($scope.item.phoneCountry, $scope.item.phoneNumber)
                    .success(function (data) {
                        var res = data.val
                        if (_.isArray(res) && res.length > 0) {
                            $scope.item.userId = data.val[0].id
                            console.log($scope.item.userId)
                        } else {
                            $scope.item.userId = undefined
                        }
                    }).error(function (data) {
                        $scope.item.userId = undefined
                    })
            }).error(function () {
                $scope.item.userId = undefined
            })

        }

        function checkPhone(country, phone) {
            return $http.get('/api/1/user/phone_test', {
                params: {
                    country: country,
                    phone: phone
                }
            })
        }

        function getUserByPhone(country, phone) {
            return $http.get('/api/1/user/admin/search', {
                params: {
                    country: country,
                    phone: phone
                }
            })
        }

        $scope.addCustomFields = function () {
            if (!$scope.item.custom_fields) {
                $scope.item.custom_fields = []
            }
            var temp = {key: $scope.item.tempKey, value: $scope.item.tempValue}
            $scope.item.custom_fields.push(angular.copy(temp))
            $scope.item.tempKey = undefined
            $scope.item.tempValue = undefined
        }
    }

    angular.module('app').controller('ctrlIntentionCreate', ctrlIntentionCreate)

})()

