
angular.module('app')
    .constant('email_event', [
      { name: i18n('点击链接'), value: 'click' },
      { name: i18n('点击率'), value: 'click_ratio' },
      { name: i18n('重复点击次数'), value: 'click_repeat' },
      { name: i18n('邮件到达'), value: 'delivered' },
      { name: i18n('到达率'), value: 'delivered_ratio' },
      { name: i18n('邮件被打开'), value: 'open' },
      { name: i18n('打开率'), value: 'open_ratio' },
      { name: i18n('重复打开次数'), value: 'open_repeat' },
      { name: i18n('此类邮件发出的总数量'), value: 'total' }
    ]).run(function ($rootScope, email_event) {
        $rootScope.email_event = email_event
    })
