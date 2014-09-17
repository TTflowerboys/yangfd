/* Created by frank on 14-9-17. */


(function () {

    function ctrlPropertyList($scope, $state, enumApi) {
        enumApi.getAll({
            params: {type: 'news_category'}
        }).success(function (data) {
            $scope.newsCategoryList = data.val
        })
    }

    angular.module('app').controller('ctrlPropertyList', ctrlPropertyList)

})()


