/* Created by frank on 14-9-17. */


(function () {

    function ctrlPropertyList($scope, $state, enumApi) {
        console.log("enumApi:")
        console.log(enumApi)
        $scope.newsCategoryList = []
        enumApi.getEnumsByType({
            params: {type: 'news_category'}
        }).success(function (data) {
            $scope.newsCategoryList = data.val
            console.log("$scope.newsCategoryList:")
            console.log($scope.newsCategoryList)
        })
    }

    angular.module('app').controller('ctrlPropertyList', ctrlPropertyList)

})()


