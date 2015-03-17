/* Created by frank on 14-9-15. */
angular.module('app')
    .constant('propertyStatus', [
        {name: i18n('草稿'), value: 'draft'},
        {name: i18n('待翻译'), value: 'not translated'},
        {name: i18n('翻译中'), value: 'translating'},
        {name: i18n('待审核'), value: 'not reviewed'},
        {name: i18n('审核失败'), value: 'rejected'},
        {name: i18n('在售中'), value: 'selling'},
        {name: i18n('受限制'), value: 'restricted'},
        {name: i18n('隐藏'), value: 'hidden'},
        {name: i18n('已售罄'), value: 'sold out'}
//{ name: '删除', value: 'deleted' }
    ])
    .constant('propertyNormalStatus', [
        {name: i18n('草稿'), value: 'draft'},
        {name: i18n('待翻译'), value: 'not translated'},
        {name: i18n('翻译中'), value: 'translating'},
        {name: i18n('待审核'), value: 'not reviewed'},
        {name: i18n('审核失败'), value: 'rejected'}
        //{ name: '删除', value: 'deleted' }
    ])
    .constant('propertyReviewStatus', [
        {name: i18n('待审核'), value: 'not reviewed'},
        {name: i18n('审核拒绝'), value: 'rejected'},
        {name: i18n('审核通过'), value: 'selling'},
    ])
    .constant('propertySellingStatus', [
        {name: i18n('在售中'), value: 'selling'},
        {name: i18n('受限制'), value: 'restricted'},
        {name: i18n('隐藏'), value: 'hidden'},
        {name: i18n('已售罄'), value: 'sold out'}
    ]).run(function ($rootScope, propertyStatus, propertyNormalStatus) {
        $rootScope.propertyStatus = propertyStatus
        $rootScope.propertyNormalStatus = propertyNormalStatus
    })
