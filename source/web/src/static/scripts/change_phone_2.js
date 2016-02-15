

$('button[name=code]').click(function (e) {
    var $getCodeBtn = $(this)
    var resultArea = $('form[name=changePhone2]').find('.resultMessage')
    resultArea.text(window.i18n('发送中...'))
    resultArea.show()

    var phone = window.user.phone
    var theParams = {'phone': '+' + window.user.country_code + phone}
    $.betterPost('/api/1/user/sms_verification/send', theParams)
        .done(function (val) {
            resultArea.text(window.i18n('发送成功'))
        })
        .fail(function () {
            window.dhtmlx.message({ type:'error', text: window.i18n('发送失败，请重试')})
            resultArea.text(window.i18n('发送失败，请重试'))
        })
        .always(function () {
            $('.buttonLoading').trigger('end')
            countDown ()
        })
    function countDown () {
        var text = i18n('{time}s后可用')
        var time = 60
        function update() {
            if(time === 0) {
                $getCodeBtn.prop('disabled', false).text(i18n('重新获取验证码'))
            } else{
                $getCodeBtn.prop('disabled', true).text(text.replace('{time}', time--))
                setTimeout(update, 1000)
            }
        }
        update()
    }
})


$('form[name=changePhone2]').submit(function (e) {
    e.preventDefault()

    var resultArea = $(this).find('.resultMessage')
    resultArea.hide()
    var valid = $.validate(this, {onError: function (dom, validator, index) {
        window.dhtmlx.message({ type:'error', text: window.getErrorMessage(dom.name, validator)})
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
            window.dhtmlx.message({ type:'error', text: window.i18n('验证失败')})
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