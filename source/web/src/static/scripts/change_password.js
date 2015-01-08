

$('form[name=changePassword]').submit(function (e) {
    e.preventDefault()

    var resultArea = $(this).find('.resultMessage')
    resultArea.hide()
    var valid = $.validate(this, {onError: function (dom, validator, index) {
        resultArea.text(window.getErrorMessage(dom.name, validator))
        resultArea.show()
    }})

    if (!valid) {return}
    var params = $(this).serializeObject()
    var theParams = {'password': Base64.encode(params.password), 'old_password': Base64.encode(params.old_password)}
    $.betterPost('/api/1/user/edit', theParams).done(function (data) {
        window.user = data
        resultArea.text(window.i18n('修改成功'))
        location.href = '/user_settings'
    }).fail(function (data) {
        resultArea.text(window.i18n('修改失败'))
        resultArea.show()
    })
})
$('.rmm-button').removeClass('rmm-button-user').addClass('rmm-button-user-settings')