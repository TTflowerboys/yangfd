/**
 * Created by Michael on 14/9/19.
 */
angular.module('app')
    .constant('intentionTicketStatus', [
        { name: '已提交', value: 'new' },
        { name: '已指派', value: 'assigned' },
        { name: '受理中', value: 'in_progress' },
        { name: '定金已支付', value: 'deposit' },
        { name: '未达成定金', value: 'suspend' },
        { name: '购房已成功', value: 'bought' },
        { name: '未达成购房', value: 'canceled' }
    ])
    .constant('intentionStatusDictionary', {
        assigned: [
            { name: '已指派', value: 'assigned' },
            { name: '受理中', value: 'in_progress' }
        ],
        in_progress: [
            { name: '受理中', value: 'in_progress' },
            { name: '定金已支付', value: 'deposit' },
            { name: '未达成定金', value: 'suspend' }
        ],
        deposit: [
            { name: '定金已支付', value: 'deposit' },
            { name: '购房已成功', value: 'bought' },
            { name: '未达成购房', value: 'canceled' }
        ]
    }).run(function ($rootScope, intentionTicketStatus) {
        $rootScope.intentionTicketStatus = intentionTicketStatus
    })
