
angular.module('app')
    .constant('email_tag', [
      { name: i18n('带有初始密码的新用户注册成功邮件'), value: 'new_user' },
      { name: i18n('邮箱重置密码'), value: 'reset_password_by_email' },
      { name: i18n('邮箱验证'), value: 'verify_email' },
      { name: i18n('草稿未发布的第3天提醒'), value: 'draft_not_publish_day_3' },
      { name: i18n('草稿未发布的第7天提醒'), value: 'draft_not_publish_day_7' },
      { name: i18n('房源成功发布的邮件提醒'), value: 'rent_ticket_publish_success' },
      { name: i18n('每周通知房源发布中的房东更新房源状态的邮件提醒'), value: 'rent_notice' },
      { name: i18n('房源被下架的邮件提醒'), value: 'rent_suspend_notice' },
      { name: i18n('London房产投资推广邮件'), value: 'property_ad' },
      { name: i18n('部分匹配到了的房源的邮件通知'), value: 'rent_intention_matched_4' },
      { name: i18n('完全匹配到了合适的房源的邮件通知'), value: 'rent_intention_matched_1' },
      { name: i18n('提交的求租意向单已经收到，并给与第一次匹配'), value: 'rent_intention_digest' },
      { name: i18n('提交的投资意向单已经收到的邮件提醒'), value: 'receive_intention' },
      { name: i18n('账号被设置成了管理员'), value: 'set_as_admin' },
      { name: i18n('有新的求租意向单'), value: 'new_rent_intention_ticket' },
      { name: i18n('有新的投资意向单'), value: 'new_intention_ticket' },
      { name: i18n('有新的咨询申请单'), value: 'new_rent_request_intention_ticket' }
    ]).run(function ($rootScope, email_tag) {
        $rootScope.email_tag = email_tag
    })
