/* Created by frank on 14-8-28. */
angular.module('app')
    .constant('permissions', [
        { name: '初级平台管理员', value: 'jr_admin' },
        { name: '高级平台管理员', value: 'admin' },
        { name: '初级平台销售人员', value: 'jr_sales' },
        { name: '高级平台销售人员', value: 'sales' },
        { name: '初级平台运营人员', value: 'jr_operation' },
        { name: '高级平台运营人员', value: 'operation' },
        { name: '初级平台客服', value: 'jr_support' },
        { name: '高级平台客服', value: 'support' },
        { name: '开发商管理员', value: 'developer' },
        { name: '中介管理员', value: 'agency' }
    ]).run(function ($rootScope, permissions) {
        $rootScope.permissions = permissions
    })
