$('form[name=verifyEmail]').submit(function (e) {
    e.preventDefault()

    var resultArea = $(this).find('.resultMessage')
    resultArea.hide()
    var valid = $.validate(this, {
        onError: function (dom, validator, index) {
            window.dhtmlx.message({type:'error', text: window.getErrorMessage(dom.name, validator)})
            resultArea.text(window.getErrorMessage(dom.name, validator))
            resultArea.show()
        }
    })

    if (!valid) {return}
    var params = $(this).serializeObject()

    function sendVerificationEmail() {
        return $.betterPost('/api/1/user/' + window.user.id + '/email_verification/send')
            .done(function (data) {
                resultArea.text(window.i18n('邮件已发送，如果没有收到，请在60秒后重试'))
                resultArea.show()
            })
            .fail(function (data) {
                window.dhtmlx.message({type:'error', text: window.i18n('发送验证邮件失败')})
                resultArea.text(window.i18n('发送验证邮件失败'))
                resultArea.show()
            })
    }

    function updateUserEmail() {
        return $.betterPost('/api/1/user/edit', params)
            .done(function (data) {
                window.user = data
            })
            .fail(function (data) {
                window.dhtmlx.message({type:'error', text: window.i18n('修改邮箱失败')})
                resultArea.text(window.i18n('修改邮箱失败'))
                resultArea.show()
            })
    }

    if (window.user.email && window.user.email === params.email) {
        sendVerificationEmail()
    }
    else {
        updateUserEmail().done(function (data) {
            sendVerificationEmail()
        })
    }
})

$('.rmm-button').removeClass('rmm-button-user').addClass('rmm-button-user-settings')

if (team.isPhone()) {
    $('input[name=email]').attr('placeholder',window.i18n('邮箱'))
}