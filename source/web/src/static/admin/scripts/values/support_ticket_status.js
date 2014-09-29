/* Created by frank on 14-9-15. */
angular.module('app')
    .constant('supportTicketStatus', [
        { name: '新提交', value: 'new' },
        { name: '已指派', value: 'assigned' },
        { name: '进行中', value: 'in_progress' },
        { name: '已解决', value: 'solved' },
        { name: '未解决', value: 'unsolved' }
    ])
    .constant('supportStatusDictionary', {
        assigned: [
            { name: '已指派', value: 'assigned' },
            { name: '进行中', value: 'in_progress' }
        ],
        in_progress: [
            { name: '进行中', value: 'in_progress' },
            { name: '已解决', value: 'solved' },
            { name: '未解决', value: 'unsolved' }
        ]
    })
