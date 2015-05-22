$('form[name=verifyPhone1]').submit(function (e) {
    e.preventDefault()

    var resultArea = $(this).find('.resultMessage')
    resultArea.hide()
    var valid = $.validate(this, {onError: function (dom, validator, index) {
        resultArea.text(window.getErrorMessage(dom.name, validator))
        resultArea.show()
    }})

    if (!valid) {return}
    var params = $(this).serializeObject()

    function updateUserPhone() {
        return $.betterPost('/api/1/user/edit', params)
            .done(function (data) {
                window.user = data
            })
            .fail(function (data) {
                resultArea.text(window.i18n('修改失败'))
                resultArea.show()
            })
    }


    if (window.user.phone && window.user.phone === params.phone && window.user.country && window.user.country.code === params.country) {
        location.href='/user_verify_phone_2'
    }
    else {
        updateUserPhone().done(function (data) {
            location.href='/user_verify_phone_2'
        })
    }
})
$('.rmm-button').removeClass('rmm-button-user').addClass('rmm-button-user-settings')
if (team.isPhone()) {
    $('input[name=phone]').attr('placeholder',window.i18n('手机号'))
}