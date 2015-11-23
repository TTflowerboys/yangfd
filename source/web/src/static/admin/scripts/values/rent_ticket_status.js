/**
 * Created by Arnold on 15/11/23.
 */
angular.module('app')
    .constant('rentTicketStatus', [
        { name: i18n('已出租'), value: 'rent' },
        { name: i18n('发布中'), value: 'to rent' },
        { name: i18n('草稿'), value: 'draft' },
        { name: i18n('已删除'), value: 'deleted' }
    ])
   .run(function ($rootScope, rentTicketStatus) {
        $rootScope.rentTicketStatus = rentTicketStatus
    })
