/* Created by frank on 14-8-15. */


(function () {

    function ctrlPropertyDetail($scope, $state, $http, $rootScope, api, $stateParams, misc) {
        $scope.api = api
        var itemFromParent = misc.findById($scope.$parent.list, $stateParams.id)

        if (itemFromParent) {
            $scope.item = itemFromParent
        } else {
            api.getOne($stateParams.id, {errorMessage: true})
                .success(function (data) {
                    var res = data.val
                    if (res.target_property_id) {
                        api.getOne(res.target_property_id, {errorMessage: true})
                            .success(function (data) {
                                res = angular.extend(data.val, res)
                                $scope.item = res
                            })
                    } else {
                        $scope.item = res
                    }
                })
        }

    }

    angular.module('app').controller('ctrlPropertyDetail', ctrlPropertyDetail)

})()

