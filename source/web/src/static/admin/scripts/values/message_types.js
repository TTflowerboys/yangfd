/**
 * Created by Michael on 14/9/9.
 */
angular.module('app')
    .constant('messageTypes', [
        { name: '系统消息', value: 'system' },
    ]).run(function ($rootScope, messageTypes) {
        $rootScope.messageTypes = messageTypes
    })