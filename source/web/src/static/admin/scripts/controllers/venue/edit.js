(function () {

    function ctrlVenueEdit($scope, $state, api, $stateParams, misc, growl) {
        $scope.api = api

        var itemFromParent = misc.findById($scope.$parent.list, $stateParams.id)


        if (itemFromParent) {
            onGetItem(itemFromParent)
        } else {
            api.getOne($stateParams.id)
                .success(function (data) {
                    onGetItem(data.val)
                })
        }


        function onGetItem(item) {
            if (!_.isEmpty(item.country)) {
                item.country = item.country.code
            }
            if (!_.isEmpty(item.city)) {
                item.cityName = item.city.name
                item.city = item.city.id
            }
            if(!_.isEmpty(item.maponics_neighborhood)){
                item.maponics_neighborhood = item.maponics_neighborhood.id
            }
            $scope.itemOrigin = item
            $scope.item = angular.copy($scope.itemOrigin)
        }


        $scope.submit = function ($event, form) {
            $event.preventDefault()
            $scope.submitted = true

            var changed = misc.getChangedI18nAttributes($scope.item, $scope.itemOrigin)
            if (!changed) {
                growl.addWarnMessage('Nothing to update')
                return
            }

            $scope.loading = true

            api.update(angular.extend(changed, {id: $stateParams.id}), {
                successMessage: 'Update successfully',
                errorMessage: 'Update failed'
            }).success(function () {
                angular.extend($scope.itemOrigin, changed)
                $state.go('^')
            })['finally'](function () {
                $scope.loading = false
            })
        }


    }

    angular.module('app').controller('ctrlVenueEdit', ctrlVenueEdit)

})()