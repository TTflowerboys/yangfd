/* Created by frank on 14-8-28. */
angular.module('app')
    .constant('permissions', [
        { name: i18n('初级平台管理员'), value: 'jr_admin' },
        { name: i18n('高级平台管理员'), value: 'admin' },
        { name: i18n('初级平台销售人员'), value: 'jr_sales' },
        { name: i18n('高级平台销售人员'), value: 'sales' },
        { name: i18n('初级平台运营人员'), value: 'jr_operation' },
        { name: i18n('高级平台运营人员'), value: 'operation' },
        { name: i18n('初级平台客服'), value: 'jr_support' },
        { name: i18n('高级平台客服'), value: 'support' },
        { name: i18n('开发商管理员'), value: 'developer' },
        { name: i18n('中介管理员'), value: 'agency' }
    ]).run(function ($rootScope, permissions) {
        $rootScope.permissions = permissions
    })
