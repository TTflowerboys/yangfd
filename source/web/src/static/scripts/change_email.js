

$('form[name=changeEmail]').submit(function (e) {
    e.preventDefault()

    var resultArea = $(this).find('.resultMessage')
    resultArea.hide()
    var valid = $.validate(this, {onError: function (dom, validator, index) {
        resultArea.text(window.getErrorMessage(dom.name, validator))
        resultArea.show()
    }})

    if (!valid) {return}
    var params = $(this).serializeObject()
    $.post('/api/1/user/edit', params).done(function (data) {
        window.user = data
        resultArea.text(window.i18n('修改邮箱成功'))
        location.href = '/user_settings'
    }).fail(function (data) {
        resultArea.text(window.i18n('修改邮箱失败'))
        resultArea.show()
    })
})
