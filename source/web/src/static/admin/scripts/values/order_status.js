/**
 * Created by zhou on 15-1-23.
 */
angular.module('app')
    .constant('orderStatus', [
        { name: i18n('已付款'), value: 'paid' },
        { name: i18n('待支付'), value: 'pending' },
        { name: i18n('已取消'), value: 'canceled' },
        { name: i18n('未支付'), value: 'unpaid' }
    ]).run(function ($rootScope, orderStatus) {
        $rootScope.orderStatus = orderStatus
    })