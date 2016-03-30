(function () {

    function ctrlAffiliateDetail($scope, $state, misc, api, statisticsApi, $rootScope, growl, $timeout) {
        var date = new Date()
        $scope.selected = {
            date_from: new Date(date.getFullYear(), date.getMonth(), 1).getTime() / 1000,
            date_to: date.getTime() / 1000
        }
        $scope.data = {}
        $scope.coupon = {}

        var itemFromParent = misc.findById($scope.$parent.list, $state.params.id)
        if (itemFromParent) {
            $scope.item = itemFromParent
            $scope.coupon = _.extend($scope.coupon, _.clone($scope.item.coupon) || {discount: {value: '50', unit: 'GBP'}, expire_time: new Date(date.getFullYear(), date.getMonth() + 1, 0).getTime() / 1000})
            if($scope.coupon.category && $scope.coupon.category.id) {
                $scope.coupon.category = $scope.coupon.category.id
            }
        } else {
            api.getOne($state.params.id, { errorMessage: true})
                .success(function (data) {
                    $scope.item = data.val
                    $scope.coupon = _.extend($scope.coupon, _.clone($scope.item.coupon) || {discount: {value: '50', unit: 'GBP'}, expire_time: new Date(date.getFullYear(), date.getMonth() + 1, 0).getTime() / 1000})
                    if($scope.coupon.category && $scope.coupon.category.id) {
                        $scope.coupon.category = $scope.coupon.category.id
                    }
                })
        }

        $scope.editReferralCode = function () {
            $scope.item.referral_code_tmp = $scope.item.referral_code
            $scope.referralCodeEditing = true
        }

        $scope.updateReferralCode = function () {
            if($scope.item.referral_code_tmp === $scope.item.referral_code) {
                growl.addErrorMessage($rootScope.i18n('您提交的Affiliate Code没有改变'), {enableHtml: true})
                return $scope.cancelUpdateReferralCode()
            }
            api.assignReferralCode({
                code: $scope.item.referral_code_tmp
            }, {
                successMessage: 'Update successfully',
                errorMessage: 'Update failed'
            })
                .success(function () {
                    $scope.referralCodeEditing = false
                    $scope.item.referral_code = $scope.item.referral_code_tmp
                })
        }
        $scope.cancelUpdateReferralCode = function () {
            $scope.referralCodeEditing = false
        }

        $scope.updateCoupon = function () {
            if($scope.coupon.discount && $scope.coupon.category) {
                api.update($scope.item.id, {
                    coupon: misc.cleanEmptyData($scope.coupon, true)
                }, {
                    successMessage: 'Update successfully',
                    errorMessage: 'Update failed'
                })
            }
        }
        statisticsApi.getNewAffiliateUserBehavior({
            user_id: $state.params.id
        }).success(function (data) {
            if(data.val && data.val.length) {
                $scope.data.userTotal = data.val[0].affiliate_new_user_total //总注册会员数
            }
        })
        statisticsApi.getAllAffiliateUserBehavior({
            user_id: $state.params.id
        }).success(function (data) {
            if(data.val && data.val.length) {
                $scope.data.requestTotal = data.val[0].affiliate_all_user_request_count //总咨询单数目
                $scope.data.successRentTotal = data.val[0].affiliate_all_user_success_rent //总成交量
            }
        })
        $scope.getAggregateData = function () {
            statisticsApi.getNewAffiliateUserBehavior(_.extend({
                user_id: $state.params.id
            }, misc.cleanEmptyData($scope.selected, true))).success(function (data) {
                if(data.val && data.val.length) {
                    $scope.data.userNew = data.val[0].affiliate_new_user_total //所选时间段新注册会员数
                    $scope.data.requestNew = data.val[0].affiliate_user_request_count //所选时间段新注册会员咨询单数目
                    $scope.data.successRentNew = data.val[0].affiliate_user_success_rent //所选时间段新注册会员成交量
                }
            })
            statisticsApi.getAllAffiliateUserBehavior(_.extend({
                user_id: $state.params.id
            }, misc.cleanEmptyData($scope.selected, true))).success(function (data) {
                if(data.val && data.val.length) {
                    $scope.data.requestCount = data.val[0].affiliate_all_user_request_count //所选时间段咨询单数目
                    $scope.data.successRentCount = data.val[0].affiliate_all_user_success_rent //所选时间段成交量
                }
            })
        }
    }

    angular.module('app').controller('ctrlAffiliateDetail', ctrlAffiliateDetail)
})()


