(function () {

    function ctrlAffiliateDetailRequestsDetail($scope, $state, misc, api, couponApi) {
        $scope.selected = {}

        var itemFromParent = misc.findById($scope.$parent.list, $state.params.request_id)
        if (itemFromParent) {
            $scope.item = itemFromParent
        } else {
            api.getOne($state.params.request_id, { errorMessage: true})
                .success(function (data) {
                    $scope.item = data.val
                    couponApi.search({
                        user_id: $scope.item.user.id
                    })
                        .success(function (data) {
                            if(data.val && data.val.length) {
                                $scope.item.offer = data.val[0]
                            }
                        })
                })
        }

    }

    angular.module('app').controller('ctrlAffiliateDetailRequestsDetail', ctrlAffiliateDetailRequestsDetail)
})()


