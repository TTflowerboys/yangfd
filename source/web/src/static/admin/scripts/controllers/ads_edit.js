/**
 * Created by Arnold on 14/9/23.
 */

(function () {

    function ctrlAdsEdit($scope,api,$stateParams,misc, growl) {
        console.log('ctrlAdsEdit')
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

        $scope.addTextItem = function(){
            //Init Text Field if add item for the first time
            $scope.item.text = $scope.item.text || {}
            $scope.item.text[$scope.userLanguage.value] = $scope.item.text[$scope.userLanguage.value] || []

            //Copy input text to text, only add to current language
            $scope.item.text[$scope.userLanguage.value].push($scope.tempTextItem)

            //Reset text input
            $scope.tempTextItem = ''
        }

        $scope.removeTextItem = function(index){
            //Remove from current language only
            $scope.item.text[$scope.userLanguage.value].splice(index, 1)
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

            $scope.api.update(angular.extend(changed, {id: $scope.item.id}), {
                successMessage: 'Update successfully',
                errorMessage: 'Update failed'
            }).success(function () {
                angular.extend($scope.itemOrigin, changed)
            })['finally'](function () {
                $scope.loading = false
            })
        }
    }

    angular.module('app').controller('ctrlAdsEdit', ctrlAdsEdit)

})()

