(function () {

    function ctrlAffiliateCreate($scope, $state, misc, $timeout, userApi, adminApi, growl) {

        $scope.item = {}
        $scope.$watch('[item.phoneCountry, item.phoneNumber]', function () {
            if($scope.item.phoneCountry && $scope.item.phoneNumber) {
                $scope.item.phone = misc.getCountryCode($scope.item.phoneCountry) + $scope.item.phoneNumber
            }
        }, true)

        $scope.submit = function (event, form) {
            function assignReferralCode(id) {
                var params = {
                    user_id: id
                }
                if($scope.item.referralCode) {
                    params.code = $scope.item.referralCode
                }
                userApi.assignReferralCode(params, {
                    errorMessage: true
                }).success(function () {
                    $state.go('^', {}, {reload:true})
                }).error(function (data) {
                    if(data.ret === 40348) {
                        growl.addErrorMessage(i18n('Affiliate Code 已经存在，请用其他的Affiliate Code重试'), {enableHtml: true})
                    }
                })
            }
            if(!$scope.item.id) {
                userApi.addAdminUser({
                    country: $scope.item.phoneCountry,
                    phone: $scope.item.phoneNumber,
                    role: ['affiliate'],
                    nickname: $scope.item.nickname,
                    email: $scope.item.email
                }, {
                    successMessage: i18n('创建Affiliate用户成功'),
                    errorMessage: true
                }).success(function (data) {
                    angular.extend($scope.item, _.pick(data.val, 'id', 'nickname', 'email', 'role'))
                    angular.extend($scope.existingItem, data.val)
                    assignReferralCode(data.val.id)
                })
            } else {
                adminApi.addRole($scope.item.id, 'affiliate', {
                    errorMessage: true
                }).success(function () {
                    assignReferralCode($scope.item.id)
                })
            }
        }


    }

    angular.module('app').controller('ctrlAffiliateCreate', ctrlAffiliateCreate)

})()