/**
 * Created by levy on 15-5-28.
 */
angular.module('app')
    .constant('rentStatus', [
        {name: i18n('草稿'), value: 'draft'},
        {name: i18n('待出租'), value: 'to rent'},
        {name: i18n('隐藏'), value: 'hidden'},
        {name: i18n('已出租'), value: 'rent'},
    ])
    .run(function ($rootScope, rentStatus) {
        $rootScope.rentStatus = rentStatus
    })
