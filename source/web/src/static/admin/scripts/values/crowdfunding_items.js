/**
 * Created by zhou on 15-1-21.
 */
angular.module('app')
    .constant('crowdfundingItems', [
        {name: i18n('名称'), value: 'name'},
        {name: i18n('房产类型'), value: 'property_type'},
        {name: i18n('投资类型'), value: 'investment_type'},
        {name: i18n('投资标签'), value: 'intention'},
        {name: i18n('国家'), value: 'country'},
        {name: i18n('城市'), value: 'city'},
        {name: i18n('街区'), value: 'street'},
        {name: i18n('邮编'), value: 'zipcode'},
        {name: i18n('地址详情'), value: 'address'},
        {name: i18n('亮点'), value: 'highlight'},
        {name: i18n('详情'), value: 'description'},
        {name: i18n('项目周期'), value: 'term'},
        {name: i18n('项目总金额'), value: 'funding_goal'},
        {name: i18n('项目起投金额'), value: 'funding_min'},
        {name: i18n('最小预估年化回报率'), value: 'min_annual_return_estimated'},
        {name: i18n('最大预估年化回报率'), value: 'max_annual_return_estimated'},
        {name: i18n('最小年化现金回报预估'), value: 'min_annual_cash_return_estimated'},
        {name: i18n('最大年化现金回报预估'), value: 'max_annual_cash_return_estimated'},
        {name: i18n('地理位置经度'), value: 'longitude'},
        {name: i18n('地理位置纬度'), value: 'latitude'},
        {name: i18n('图片'), value: 'reality_images'},
        {name: i18n('视频'), value: 'videos'},
        {name: i18n('相关资料'), value: 'materials'},
        {name: i18n('开发商介绍'), value: 'operator'},
        {name: i18n('管理团队'), value: 'management_team'},
        {name: i18n('项目财务分析介绍'), value: 'financials'},
        {name: i18n('项目资本结构'), value: 'capital_structure'},
        {name: i18n('审核备注'), value: 'comment'},
        {name: i18n('审核附件'), value: 'attachment'},
        {name: i18n('起投时间'), value: 'funding_start_date'},
        {name: i18n('截止时间'), value: 'funding_end_date'},
        {name: i18n('地图位置'), value: 'latitude_longitude'}
    ])