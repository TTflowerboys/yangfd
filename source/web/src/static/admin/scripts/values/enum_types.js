/**
 * Created by Michael on 14/9/9.
 */
angular.module('app')
    .constant('enumTypes', [
        { name: i18n('房产类型'), value: 'property_type' },
        { name: i18n('投资类型'), value: 'investment_type' },
        { name: i18n('产权类型'), value: 'equity_type' },
        { name: i18n('装修风格'), value: 'decorative_style' },
        { name: i18n('朝向'), value: 'facing_direction' },
        { name: i18n('学校类型'), value: 'school_type' },
        { name: i18n('学校年级'), value: 'school_grade' },
        { name: i18n('生活设施'), value: 'facilities' },
        { name: i18n('房产价格类型'), value: 'property_price_type' },
        { name: i18n('平台资讯类别'), value: 'news_category' },
        { name: i18n('平台消息类别'), value: 'message_type' },
        { name: i18n('投资意向单状态'), value: 'intention_ticket_status' },
        { name: i18n('客服单状态'), value: 'support_ticket_status' },
        { name: i18n('还款类型'), value: 'repayment_type' }
    ]).run(function ($rootScope, enumTypes) {
        $rootScope.enumTypes = enumTypes
    })