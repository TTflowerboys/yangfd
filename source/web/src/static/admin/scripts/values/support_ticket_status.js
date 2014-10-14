/* Created by frank on 14-9-15. */
angular.module('app')
    .constant('supportTicketStatus', [
        { name: i18n('新提交'), value: 'new' },
        { name: i18n('已指派'), value: 'assigned' },
        { name: i18n('受理中'), value: 'in_progress' },
        { name: i18n('已解决'), value: 'solved' },
        { name: i18n('未解决'), value: 'unsolved' }
    ])
    .constant('supportStatusDictionary', {
        assigned: [
            { name: i18n('已指派'), value: 'assigned' },
            { name: i18n('受理中'), value: 'in_progress' }
        ],
        in_progress: [
            { name: i18n('受理中'), value: 'in_progress' },
            { name: i18n('已解决'), value: 'solved' },
            { name: i18n('未解决'), value: 'unsolved' }
        ]
    })
