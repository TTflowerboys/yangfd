$('#login').click(function () {
    $('#modal_shadow').show()
    $('#modal').show()
});
$('#modal_shadow').click(function () {
    $('#modal_shadow').hide()
    $('#modal').hide()
});

var errorArea = $('form[name=signin]').find('.errorMessage')
$('form[name=signin]').submit(function (e) {
    e.preventDefault()
    errorArea.hide()
    var valid = $.validate(this, {onError: function (dom, validator, index) {
        errorArea.text(window.getErrorMessage(dom.name, validator))
        errorArea.show()
    }})
    if (!valid) {return}

    var params = $(this).serializeObject()
    params.password = Base64.encode(params.password)
    $.post('/api/1/user/login', params)
        .done(function () {
            location.reload()
            $('#modal_shadow').hide()
            $('#modal').hide()
        })
        .fail(function () {
            errorArea.text(window.i18n('登录失败'))
            errorArea.show()
        })
})

