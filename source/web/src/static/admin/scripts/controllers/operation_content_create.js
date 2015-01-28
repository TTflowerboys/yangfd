/* Created by Arnold on 14-8-15. */


(function () {

    function ctrlContentCreate($scope) {

        $scope.addTextItem = function () {
            //Init Text Field if add item for the first time
            $scope.item.text = $scope.item.text || {}
            $scope.item.text[$scope.userLanguage.value] = $scope.item.text[$scope.userLanguage.value] || []

            //Copy input text to text, only add to current language
            $scope.item.text[$scope.userLanguage.value].push($scope.tempTextItem)

            //Reset text input
            $scope.tempTextItem = ''
        }

        $scope.removeTextItem = function (index) {
            //Remove from current language only
            $scope.item.text[$scope.userLanguage.value].splice(index, 1)
        }

        $scope.submit = function ($event, form) {
            $event.preventDefault()
            $scope.submitted = true
            if (form.$invalid) {
                return
            }

            $scope.loading = true
            $scope.api.create($scope.item, {
                successMessage: 'Create successfully',
                errorMessage: 'Create failed'
            }).success(function () {
                if ($scope.$parent) {
                    $scope.$parent.refreshList()
                }
                $scope.$state.go('^')
            })['finally'](function () {
                $scope.loading = false
            })
        }
    }

    angular.module('app').controller('ctrlContentCreate', ctrlContentCreate)

})()

