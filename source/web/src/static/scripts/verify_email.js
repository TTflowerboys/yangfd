//TODO: if user has email help him input first

$('form[name=verifyEmail]').submit(function (e) {
    e.preventDefault()

    var resultArea = $(this).find('.resultMessage')
    resultArea.hide()
    var valid = $.validate(this, {onError: function (dom, validator, index) {
        resultArea.text(window.getInputValidationMessage(dom.name, validator))
        resultArea.show()
    }})

    if (!valid) {return}
    var params = $(this).serializeObject()    

    if (window.user.email && window.user.email === params.email) {
        $.post('/api/1/user/edit' , params)
        .done(function (data) {
            if (data.ret !== 0) {
                console.log(data)
                resultArea.text(window.i18n('修改邮箱失败'))
                resultArea.show()                
            }
            else {
               $.post('/api/1/user/' + window.user.id + 'email_verification/send', {})
                    .done(function (data) {
                        if (data.ret !== 0) {
                            resultArea.text(window.i18n('发送验证邮件失败'))
                            resultArea.show()
                        }
                        else {
                            resultArea.text(window.i18n('邮件已发送，如果没有收到，请在60秒后重试'))
                            resultArea.show()
                        }
                    })
                    .always(function () {
                        
                    })
            }
        })
        .always(function () {

        })
    }
    else {
         $.post('/api/1/user/' + window.user.id + 'email_verification/send', {})
                    .done(function (data) {
                        if (data.ret !== 0) {
                            resultArea.text(window.i18n('发送验证邮件失败'))
                            resultArea.show()
                        }
                        else {
                            resultArea.text(window.i18n('邮件已发送，如果没有收到，请在60秒后重试'))
                            resultArea.show()
                        }
                    })
                    .always(function () {
                        
                    })
    }
    
    
})
