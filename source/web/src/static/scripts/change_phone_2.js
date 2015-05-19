

$('button[name=code]').click(function (e) {

    var resultArea = $('form[name=changePhone2]').find('.resultMessage')
    resultArea.text(window.i18n('发送中...'))
    resultArea.show()

    var phone = window.user.phone
    var country = window.user.country.id
    var theParams = {'country':country, 'phone': phone}
    $.betterPost('/api/1/user/sms_verification/send', theParams)
        .done(function (val) {
            resultArea.text(window.i18n('发送成功'))
        })
        .fail(function () {
            resultArea.text(window.i18n('发送失败，请重试'))
        })
        .always(function () {
        })

})


$('form[name=changePhone2]').submit(function (e) {
    e.preventDefault()

    var resultArea = $(this).find('.resultMessage')
    resultArea.hide()
    var valid = $.validate(this, {onError: function (dom, validator, index) {
        resultArea.text(window.getErrorMessage(dom.name, validator))
        resultArea.show()
    }})

    if (!valid) {return}
    var params = $(this).serializeObject()

    $.betterPost('/api/1/user/' + window.user.id + '/sms_verification/verify', params)
        .done(function (data) {
            window.user = data
            resultArea.text(window.i18n('验证成功'))
            resultArea.show()
            location.href = '/user-settings'
        })
	.fail(function (ret) {
            resultArea.text(window.i18n('验证失败'))
            resultArea.show()
	})
        .always(function () {

        })

})

$('.rmm-button').removeClass('rmm-button-user').addClass('rmm-button-user-settings')

if (team.isPhone()) {
    $('input[name=code]').attr('placeholder',window.i18n('手机验证码'))
}