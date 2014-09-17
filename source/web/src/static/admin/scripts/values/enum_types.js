/**
 * Created by Michael on 14/9/9.
 */
angular.module('app')
    .constant('enum_types', [
        { name: '房产类型', value: 'property_type' },
        { name: '投资标签', value: 'intention' },
        { name: '产权类型', value: 'equity_type' },
        { name: '装修风格', value: 'decorative_style' },
        { name: '朝向', value: 'facing_direction' },
        { name: '学校类型', value: 'school_type' },
        { name: '学校年级', value: 'school_grade' },
        { name: '生活设施', value: 'facilities' },
        { name: '房产价格类型', value: 'property_price_type' },
        { name: '平台咨询类别', value: 'news_category' },
    ]).run(function ($rootScope, enum_types) {
        $rootScope.enum_types = enum_types
    })