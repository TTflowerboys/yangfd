/**
 * Created by chaowang on 9/23/14.
 */
(function () {

    function ctrlOperationContent($scope, $state , api, misc) {
        $scope.api = api

        //Get Channel List
        api.getAll()
            .success(function (data) {
                $scope.availableChannels = data.val

                //If got more than one channel, default select first one to show
                if($scope.availableChannels.length > 0){
                    $scope.selectedChannel = $scope.availableChannels[0]
                    $state.go('dashboard.operation.contents.channel',{channel:$scope.selectedChannel},{location:false})
                }
            })

        $scope.$watch('selectedChannel',function(newValue, oldValue){
            // Ignore initial setup.
            if ( newValue === oldValue ) {
                return;
            }

            $state.go('dashboard.operation.contents.channel',{channel:$scope.selectedChannel},{location:false})
        })
    }

    angular.module('app').controller('ctrlOperationContent', ctrlOperationContent)

})()

