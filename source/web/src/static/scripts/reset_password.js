(function () {
    $('.resetPasswordEmailForm1').submit(function (e) {
        e.preventDefault()

        var resultArea = $(this).find('.errorMessage')
        resultArea.hide()
        var valid = $.validate(this, {onError: function (dom, validator, index) {
            resultArea.text(window.getErrorMessage(dom.name, validator))
            resultArea.show()
        }})
        if (!valid) {return}
        var param = $(this).serializeObject()
        $.betterPost('/api/1/user/email_recovery/send', param)
            .done(function (data) {
                resultArea.html(i18n('重置密码邮件已经成功发送到您的邮箱，请登陆您的邮箱查收邮件')).show()
            })
            .fail(function (ret) {
                resultArea.empty()
                resultArea.append(window.getErrorMessageFromErrorCode(ret))
                resultArea.show()
            })
    })

    $('.resetPasswordEmailForm2').submit(function (e) {
        e.preventDefault()
        var resultArea = $(this).find('.errorMessage')
        resultArea.hide()

        var valid = $.validate(this, {
            onError: function (dom, validator, index) {
                resultArea
                    .text(dom.getAttribute('data-error-' + validator) || window.getErrorMessage(dom.name,
                        validator))
                    .show()
            }
        })

        if (!valid) {return}


        var params = $(this).serializeObject()
        params.new_password = Base64.encode(params.new_password)

        $.betterPost('/api/1/user/email_recovery/reset_password', params)
            .done(function (val) {
                resultArea.html(i18n('密码重置成功，5s后自动返回首页')).show()
                setTimeout(function () {
                    window.project.goBackFromURL()
                }, 5000)
            })
            .fail(function () {
                resultArea.text(window.i18n('重置密码失败'))
                resultArea.show()
            })
    })
})()
