(function () {

    function ctrlAffiliateRole($scope, $state, misc, api, statisticsApi, $timeout, rentRequestIntentionApi) {
        $scope.data = {}
        $scope.coupon = {}

        $scope.item = $scope.user
        $scope.coupon = _.extend($scope.coupon, _.clone($scope.item.coupons) || {discount: {value: '50', unit: 'GBP'}})

        $scope.list = []

        $scope.api = api
        $scope.fetched = false

        $scope.refreshList = function () {
            api.getAll({
                params: {
                    referral: $scope.user.id,
                    per_page: -1
                }
            }).success(onGetList)
        }

        function onGetList(data) {
            $scope.fetched = true
            $scope.list = _.map(
                data.val,
                function (item, index) {
                    rentRequestIntentionApi.getAll({
                        params: {
                            user_id: item.id,
                            status: JSON.stringify(['requested','assigned','in_progress','rejected','confirmed_video','booked','holding_deposit_paid','canceled','checked_in'])
                        }
                    }).success(
                        function (data) {
                            $scope.list[index].requested_tickets_count = data.val.length
                            var success_count = 0
                            data.val.forEach(function(item) {
                                if (item.status === 'checked_in') {
                                    success_count += 1
                                }
                            })
                            $scope.list[index].success_rent_tickets_count = success_count
                        }
                    )
                    /*couponApi.search({
                        user_id: item.id
                    })
                        .success(function (data) {
                            //todo 等接口修复后再填充优惠券数据
                        })*/
                    return item
                }
            )
        }


        $timeout(function () {
            $scope.refreshList()

            statisticsApi.getNewAffiliateUserBehavior({
                user_id: $scope.user.id
            }).success(function (data) {
                if(data.val && data.val.length) {
                    $scope.data.userTotal = data.val[0].affiliate_new_user_total //总注册会员数
                }
            })

            statisticsApi.getAllAffiliateUserBehavior({
                user_id: $scope.user.id
            }).success(
                function (data) {
                    if(data.val && data.val.length) {
                        $scope.data.request_count = data.val[0].affiliate_all_user_request_count
                        $scope.data.success_rent = data.val[0].affiliate_all_user_success_rent
                    }
                }
            )
        })
    }

    angular.module('app').controller('ctrlAffiliateRole', ctrlAffiliateRole)
})()
