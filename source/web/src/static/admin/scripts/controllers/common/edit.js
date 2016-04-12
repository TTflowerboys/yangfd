/* Created by frank on 14-8-15. */


(function () {

    function ctrlEdit($scope, $state, api, $stateParams, misc, growl) {
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
                $state.go('^', {}, {reload:true})
            })['finally'](function () {
                $scope.loading = false
            })
        }


    }

    angular.module('app').controller('ctrlEdit', ctrlEdit)

})()

