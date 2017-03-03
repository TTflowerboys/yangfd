

$('form[name=changeEmail]').submit(function (e) {
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

    if (params.email === window.user.email) {
        resultArea.text(window.i18n('请填入新邮箱'))
        resultArea.show()
        return;
    }
    
    $.betterPost('/api/1/user/edit', params).done(function (data) {
        window.user = data
        resultArea.empty()
        resultArea.text(window.i18n('修改邮箱成功'))
        location.href = '/user-settings'
    }).fail(function (errorCode) {
        resultArea.empty()
        window.dhtmlx.message({ type:'error', text: window.getErrorMessageFromErrorCode(errorCode)})
        resultArea.append(window.getErrorMessageFromErrorCode(errorCode))
        resultArea.show()
    })
})
