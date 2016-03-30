//new, used, expired， deleted
angular.module('app')
    .constant('couponStatus', [
        { name: i18n('未使用'), value: 'new' },
        { name: i18n('已使用'), value: 'used' },
        { name: i18n('已过期'), value: 'expired' },
        { name: i18n('已删除'), value: 'deleted' },
    ])
    .run(function ($rootScope, couponStatus) {
        $rootScope.couponStatus = couponStatus
    })
