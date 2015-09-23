/**
 * Created by Michael on 14/9/9.
 */
angular.module('app')
    .constant('enumTypes', [
        { name: i18n('房间设施'), value: 'indoor_facility' },
        { name: i18n('小区设施'), value: 'community_facility' },
        { name: i18n('街区亮点'), value: 'region_highlight' },
        { name: i18n('职业'), value: 'occupation' },
        { name: i18n('出租类型'), value: 'rent_type' },
        { name: i18n('押金选项'), value: 'deposit_type' },
        { name: i18n('租期类型'), value: 'rent_period' },
        { name: i18n('房东类型'), value: 'landlord_type' },
        { name: i18n('平台消息类别'), value: 'message_type' },
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
        { name: i18n('投资意向单状态'), value: 'intention_ticket_status' },
        { name: i18n('客服单状态'), value: 'support_ticket_status' },
        { name: i18n('用户类型'), value: 'user_type' },
        { name: i18n('用户来源'), value: 'user_referrer' }
    ]).run(function ($rootScope, enumTypes) {
        $rootScope.enumTypes = enumTypes
    })