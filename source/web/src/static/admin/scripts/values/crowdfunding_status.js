/**
 * Created by zhou on 15-1-19.
 */
angular.module('app')
    .constant('crowdfundingStatus', [
        {name: i18n('草稿'), value: 'draft'},
        {name: i18n('待翻译'), value: 'not translated'},
        {name: i18n('翻译中'), value: 'translating'},
        {name: i18n('待审核'), value: 'not reviewed'},
        {name: i18n('审核失败'), value: 'rejected'},
        {name: i18n('在售中'), value: 'new'},
        {name: i18n('隐藏'), value: 'hidden'},
        {name: i18n('已售罄'), value: 'sold out'}
//{ name: '删除', value: 'deleted' }
    ])
    .constant('crowdfundingNormalStatus', [
        {name: i18n('草稿'), value: 'draft'},
        {name: i18n('待翻译'), value: 'not translated'},
        {name: i18n('翻译中'), value: 'translating'},
        {name: i18n('待审核'), value: 'not reviewed'},
        {name: i18n('审核失败'), value: 'rejected'}
        //{ name: '删除', value: 'deleted' }
    ])
    .constant('crowdfundingReviewStatus', [
        {name: i18n('待审核'), value: 'not reviewed'},
        {name: i18n('审核拒绝'), value: 'rejected'},
        {name: i18n('审核通过'), value: 'new'},
    ])
    .constant('crowdfundingSellingStatus', [
        {name: i18n('在售中'), value: 'new'},
        {name: i18n('隐藏'), value: 'hidden'},
        {name: i18n('已售罄'), value: 'sold out'}
    ]).run(function ($rootScope, crowdfundingStatus, crowdfundingNormalStatus) {
        $rootScope.crowdfundingStatus = crowdfundingStatus
        $rootScope.crowdfundingNormalStatus = crowdfundingNormalStatus
    })
