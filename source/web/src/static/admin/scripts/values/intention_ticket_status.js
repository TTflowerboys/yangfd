/**
 * Created by Michael on 14/9/19.
 */
angular.module('app')
    .constant('intentionTicketStatus', [
        { name: i18n('意向已提交'), value: 'new' },
        { name: i18n('咨询申请已提交'), value: 'requested' },
        { name: i18n('已指派'), value: 'assigned' },
        { name: i18n('受理中'), value: 'in_progress' },
        { name: i18n('定金已支付'), value: 'deposit' },
        { name: i18n('未达成定金'), value: 'suspend' },
        { name: i18n('购房已成功'), value: 'bought' },
        { name: i18n('未达成购房'), value: 'canceled' }
    ])
    .constant('intentionStatusDictionary', {
        assigned: [
            { name: i18n('已指派'), value: 'assigned' },
            { name: i18n('受理中'), value: 'in_progress' }
        ],
        in_progress: [
            { name: i18n('受理中'), value: 'in_progress' },
            { name: i18n('定金已支付'), value: 'deposit' },
            { name: i18n('未达成定金'), value: 'suspend' }
        ],
        deposit: [
            { name: i18n('定金已支付'), value: 'deposit' },
            { name: i18n('购房已成功'), value: 'bought' },
            { name: i18n('未达成购房'), value: 'canceled' }
        ]
    }).run(function ($rootScope, intentionTicketStatus) {
        $rootScope.intentionTicketStatus = intentionTicketStatus
    })
