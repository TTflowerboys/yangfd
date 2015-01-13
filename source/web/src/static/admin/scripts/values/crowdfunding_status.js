/**
 * Created by zhou on 15-1-13.
 */
angular.module('app')
    .constant('crowdfundingStatus', [
        {name: i18n('在售中'), value: 'new'},
        {name: i18n('已售罄'), value: 'sold out'}
    ]).run(function ($rootScope, crowdfundingStatus) {
        $rootScope.crowdfundingStatus = crowdfundingStatus
    })
