/* Created by frank on 14-8-15. */


(function () {

    function ctrlCreateAdOnAnyChannel($scope, $state, api) {


        $scope.item = {}
        $scope.channels = $scope.$parent.channels

        $scope.submit = function ($event, form) {
            $event.preventDefault()
            $scope.submitted = true
            if (form.$invalid) { return }
            $scope.loading = true
            api.create($scope.item, {
                successMessage: 'Update successfully',
                errorMessage: 'Update failed'
            }).success(function () {
                $scope.$parent.refreshChannels()
                $state.go('^')
            })['finally'](function () {
                $scope.loading = false
            })
        }


    }

    angular.module('app').controller('ctrlCreateAdOnAnyChannel', ctrlCreateAdOnAnyChannel)

})()

