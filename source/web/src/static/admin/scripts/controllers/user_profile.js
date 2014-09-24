/**
 * Created by chaowang on 9/23/14.
 */
(function () {

    function ctrlUserProfile($scope, $location , api, $stateParams, misc) {
        $scope.list = []
        $scope.perPage = 12
        $scope.currentPageNumber = 1
        $scope.pages = []
        $scope.api = api

        //Get User Profile Infomation
        var itemFromParent = misc.findById($scope.$parent.list, $stateParams.id)
        if (itemFromParent) {
            $scope.item = itemFromParent
        } else {
            api.getOne($stateParams.id)
                .success(function (data) {
                    $scope.item = data.val
                })
        }
        /*// Default select favourite properties
        onTabActived('favs')

        //Get active list data
        function onTabActived(tabname){
            switch(tabname){
                case 'favs':
                case 'intentions':
                case 'boughts':
                case 'supports':
                    $location.path( '/' + tabname )
                    break
                default:
                    $location.path( '/' + 'favs' )
            }
        }*/
    }

    angular.module('app').controller('ctrlUserProfile', ctrlUserProfile)

})()

