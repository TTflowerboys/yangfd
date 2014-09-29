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

            if (!_.isEmpty($scope.item.text)) {
                $scope.item.tempTexts = []

                //Default think all language's text are same length
                //TODO this should change to different language with different length in the future
                var length = $scope.item.text[$scope.userLanguage.value].length
                for(var i=0;i<length;i++){
                    $scope.item.tempTexts[i] = $scope.item.tempTexts[i] || {}
                    angular.forEach($scope.i18nLanguages, function(i18nValue, i18nKey){
                        $scope.item.tempTexts[i][i18nValue.value] = $scope.item.text[i18nValue.value][i]
                    })
                }
                console.log($scope.item.tempTexts)
            }
        }

        $scope.addTextItem = function(){
            $scope.item.tempTexts = $scope.item.tempTexts || []
            var tempTextItem = {}
            angular.copy($scope.tempTextItem, tempTextItem);
            $scope.item.tempTexts.push(tempTextItem)

            //Reset text input
            angular.forEach($scope.tempTextItem, function(value, key){
                $scope.tempTextItem[key] = ''
            })

            console.log($scope.item.tempTexts)
        }

        $scope.removeTextItem = function(index){
            $scope.item.tempTexts.splice(index, 1)

            console.log($scope.item.tempTexts)
        }

        $scope.submit = function ($event, form) {
            $event.preventDefault()
            $scope.submitted = true

            if (!_.isEmpty($scope.item.tempTexts)) {
                $scope.item.text = {}
                angular.forEach($scope.i18nLanguages, function(i18nValue, i18nKey){
                    $scope.item.text[i18nValue.value] = $scope.item.text[i18nValue.value] || []
                    angular.forEach($scope.item.tempTexts, function(value, key){
                        $scope.item.text[i18nValue.value].push(value[i18nValue.value])
                    })
                })
            }

            delete $scope.item.tempTexts
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

