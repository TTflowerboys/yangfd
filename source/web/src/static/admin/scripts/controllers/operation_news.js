/**
 * Created by chaowang on 10/02/14.
 */
(function () {

    function ctrlOperationNews($scope) {
        var newsApi = $scope.$parent.api
        //Work around angular can not watch primitive type
        $scope.selected = {}
        $scope.selected.category = {}

        var params = {
            per_page: $scope.perPage
        }

        /*        $scope.$watch('newsCategoryList', function (value) {
         console.log(value)
         if(!_.isUndefined(value)&&value.length>0){
         $scope.selected.category = value[0]
         }
         })*/

        $scope.$watch('selected.category', function (newValue, oldValue) {
            // Ignore initial setup.
            if (newValue === oldValue) {
                return
            }

            params.category = $scope.selected.category.id
            newsApi.getAll({ params: params, errorMessage: true }).success($scope.onGetList)
        }, true)
    }

    angular.module('app').controller('ctrlOperationNews', ctrlOperationNews)

})()

