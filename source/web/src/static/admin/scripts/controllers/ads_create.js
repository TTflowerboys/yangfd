/* Created by frank on 14-8-15. */


(function () {

    function ctrlAdsCreate($scope) {

        console.log('ctrlAdsCreate')

        $scope.addTextItem = function(){
            $scope.item.tempTexts = $scope.item.tempTexts || []
            var tempTextItem = {}
            angular.copy($scope.tempTextItem, tempTextItem);
            $scope.item.tempTexts.push(tempTextItem)

            //Reset text input
            angular.forEach($scope.tempTextItem, function(value, key){
                $scope.tempTextItem[key] = ''
            })
        }

        $scope.removeTextItem = function(index){
            $scope.item.tempTexts.splice(index, 1)
        }

        $scope.submit = function ($event, form) {
            $event.preventDefault()
            $scope.submitted = true
            if (form.$invalid) {
                return
            }

            if (!_.isEmpty($scope.item.tempTexts)) {
                $scope.item.text = $scope.item.text || {}
                angular.forEach($scope.i18nLanguages, function(i18nValue, i18nKey){
                    $scope.item.text[i18nValue.value] = $scope.item.text[i18nValue.value] || []
                    angular.forEach($scope.item.tempTexts, function(value, key){
                        $scope.item.text[i18nValue.value].push(value[i18nValue.value])
                    })
                })
            }

            $scope.loading = true
            $scope.api.create($scope.item, {
                successMessage: 'Create successfully',
                errorMessage: 'Create failed'
            }).success(function () {
                if ($scope.$parent.currentPageNumber === 1) {
                    $scope.$parent.refreshList()
                }
                $scope.$state.go('^')
            })['finally'](function () {
                $scope.loading = false
            })
        }
    }

    angular.module('app').controller('ctrlAdsCreate', ctrlAdsCreate)

})()

