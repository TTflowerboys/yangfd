/* Created by frank on 14/10/21. */
window.getErrorMessage = function (domName, validator) {
    var inputMessageDic = {
        'nickname_required': i18n('姓名不能为空'),
        'phone_required': i18n('电话不能为空'),
        'phone_number': i18n('电话格式不正确'),
        'email_required': i18n('邮箱不能为空'),
        'email_email': i18n('邮箱格式不合法'),
        'code_required': i18n('验证码不能为空'),
        'password_required': i18n('密码不能为空'),
        'old_phone_required': i18n('原手机号不能为空'),
        'old_phone_number': i18n('原手机号格式不正确'),
        'old_password_required': i18n('当前密码不能为空'),
        'confirm_password_required': i18n('确认密码不能为空'),
        'confirm_password_sameAs': i18n('新密码和确认密码输入不一致')
    }
    return inputMessageDic[domName + '_' + validator] || ''
}

window.getIntentionDescription = function (slug) {
    var stringMap = {
        stable_cashflow: i18n('现金流保障介绍'),
        study_abroad: i18n('子女留学介绍'),
        immigration_investment: i18n('移民投资介绍'),
        excess_earnings: i18n('超额收益介绍'),
        asset_preservation: i18n('资产保值介绍'),
        live_after_immigration: i18n('移民自住介绍'),
        leisure_property: i18n('度假旅行介绍')
    }
    return stringMap[slug] || slug
}

window.getErrorMessageFromErrorCode = function (errorCode, api) {
    var stringMap = {
        40000: i18n('参数错误'),
        40103: i18n('账户或密码错误'),
        40324: i18n('账户不存在'),
        40325: i18n('邮箱已被使用'),
        40351: i18n('电话已被使用, 请<a href="#" onclick="project.goToSignIn()">“登陆”</a>或者<a href="#" onclick="project.goToResetPassword()">“找回密码”</a>'),
        '40351/api/1/intention_ticket/add':i18n('电话已被使用, 请<a href="#" onclick="project.showSignInModal()">“登陆”</a>'),
        40357: i18n('验证失败'),
        40399: i18n('权限错误'),
        50314: i18n('第三方服务异常')
    }

    if (!api) {
        api = ''
    }
    return stringMap[errorCode + api] || errorCode
}
