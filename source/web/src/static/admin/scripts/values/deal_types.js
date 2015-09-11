
angular.module('app')
    .constant('dealTypes', [
        { name: i18n('百分比折扣'), value: 'percentage' },
        { name: i18n('减免金额'), value: 'amount' },
        { name: i18n('自由填写文字'), value: 'free' },
    ])
    .run(function ($rootScope, dealTypes) {
        $rootScope.dealTypes = dealTypes
    })
