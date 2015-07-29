/* Created by frank on 14-8-15. */


(function () {

    function ctrlInvitationCreate($scope, $state, api) {

        $scope.api = api

        $scope.item = {}

        $scope.submit = function ($event, form) {
            $event.preventDefault()
            $scope.submitted = true
            if (form.$invalid) {
                return
            }
            $scope.loading = true
            var data = {
                email:$scope.item.email,
                tag:['invitation']
            }
            api.create(data, {
                successMessage: 'Invite successfully',
                errorMessage: 'Invite failed'
            }).success(function (data) {
                api.invite($scope.item.email).success(function () {
                    api.update(data.val,'invited').success(function(){
                        if ($scope.$parent.currentPageNumber === 1) {
                            $scope.$parent.refreshList()
                        }
                        $state.go('^')
                    })
                })
            })['finally'](function () {
                $scope.loading = false
            })
        }
    }

    angular.module('app').controller('ctrlInvitationCreate', ctrlInvitationCreate)

})()

