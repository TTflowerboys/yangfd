(function () {

    function ctrlAffiliateRole($scope, $state, misc, api, statisticsApi, $timeout, rentRequestIntentionApi) {
        $scope.data = {}
        $scope.coupon = {}
        $scope.showAggregationDataUserTotal = false
        $scope.showAggregationDataMemberTicketData = false

        $scope.item = $scope.user
        $scope.coupon = _.extend($scope.coupon, _.clone($scope.item.coupons) || {discount: {value: '50', unit: 'GBP'}})

        $scope.list = []

        $scope.api = api
        $scope.fetched = false
        
        $scope.progress = {percentage: 10}

        $timeout(function () {            
            api.getAll({
                params: {
                    referral: $scope.user.id,
                    per_page: -1
                }
            }).then(function (response) {
                if (response.status !== 200) {
                    return
                }
                var data = response.data
                $scope.fetched = true
                $scope.list = _.map(
                    data.val,
                    function (item, index) {
                        rentRequestIntentionApi.getAll({
                            params: {
                                user_id: item.id,
                                status: JSON.stringify(['requested', 'assigned', 'in_progress', 'rejected', 'confirmed_video', 'booked', 'holding_deposit_paid', 'canceled', 'checked_in'])
                            }
                        }).success(
                            function (data) {
                                $scope.list[index].requested_tickets_count = data.val.length
                                var success_count = 0
                                data.val.forEach(function (item) {
                                    if (item.status === 'checked_in') {
                                        success_count += 1
                                    }
                                })
                                $scope.list[index].success_rent_tickets_count = success_count
                            }
                            )
                        return item
                    }
                )
                $scope.progress.percentage = 50
                                                
                return  statisticsApi.getNewAffiliateUserBehavior({user_id: $scope.user.id})
            }).then(function (response) {
                if (response.status !== 200) {
                    return
                }
                var data = response.data
                if(data.val && data.val.length) {
                    $scope.data.userTotal = data.val[0].affiliate_new_user_total //总注册会员数
                    $scope.showAggregationDataUserTotal = true
                }
                
                $scope.progress.percentage = 75
                return statisticsApi.getAllAffiliateUserBehavior({user_id: $scope.user.id})
            }).then(function (response) {    
                if (response.status !== 200) {
                    return
                }
                var data = response.data           
                if (data.val && data.val.length) {
                    $scope.data.request_count = data.val[0].affiliate_all_user_request_count
                    $scope.data.success_rent = data.val[0].affiliate_all_user_success_rent
                    $scope.showAggregationDataMemberTicketData = true
                }
                $scope.progress.percentage = 100
            })                        
        })
    }

    angular.module('app').controller('ctrlAffiliateRole', ctrlAffiliateRole)
})()
