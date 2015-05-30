/**
 * Created by Michael on 14/9/19.
 */
angular.module('app')
    .constant('invitationStatus', [
        { name: i18n('新提交'), value: 'new' },
        { name: i18n('已邀请'), value: 'invited' }
    ]).run(function ($rootScope, invitationStatus) {
        $rootScope.invitationStatus = invitationStatus
    })
