
$('form[name=changePhone1]').submit(function (e) {
    e.preventDefault()

    var resultArea = $(this).find('.resultMessage')
    resultArea.hide()
    var valid = $.validate(this, {onError: function (dom, validator, index) {
        resultArea.text(window.getErrorMessage(dom.name, validator))
        resultArea.show()
    }})

    if (!valid) {return}
    var params = $(this).serializeObject()

    if (params.old_phone.toString() !== window.user.phone.toString()) {
        resultArea.text(window.i18n('原手机号不正确'))
        resultArea.show()
        return
    }

    $.betterPost('/api/1/user/edit',params)
        .done(function (data) {
            resultArea.text(window.i18n('修改成功'))
            resultArea.show()
            location.href = '/user_change_phone_2'
        })
	.fail(function (ret) {
            resultArea.text(window.i18n('修改失败'))
            resultArea.show()

	})
        .always(function () {

        })
})
$('.rmm-button').removeClass('rmm-button-user').addClass('rmm-button-user-settings')