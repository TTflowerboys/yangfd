//“new”, “requested”, “agreed”, “rejected”, “assigned”, “examined”, “rent”, “canceled”.
angular.module('app')
    .constant('rentIntentionTicketStatus', [
        { name: i18n('咨询申请已提交'), value: 'requested' },
        { name: i18n('已处理'), value: 'assigned' },
        { name: i18n('沟通中'), value: 'in_progress' },
        { name: i18n('已拒绝'), value: 'rejected' },
        { name: i18n('已确认视频看房'), value: 'confirmed_video' },
        { name: i18n('预订确认，等待支付'), value: 'booked' },
        { name: i18n('定金已支付，确认入住'), value: 'holding_deposit_paid' },
        { name: i18n('预订取消'), value: 'canceled' },
        { name: i18n('租客已入住'), value: 'checked_in' }
    ])
    .run(function ($rootScope, rentIntentionTicketStatus) {
        $rootScope.rentIntentionTicketStatus = rentIntentionTicketStatus
    })
