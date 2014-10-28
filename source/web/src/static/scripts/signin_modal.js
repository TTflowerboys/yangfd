$('#login').click(function () {
    if (team.isPhone()) {
        window.project.goToSignIn()
    }
    else {
        window.project.showSignInModal()
    }
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
    $.betterPost('/api/1/user/login', params)
        .done(function () {
            location.reload()
            $('#modal_shadow').hide()
            $('#modal').hide()
        })
        .fail(function (ret) {
            errorArea.text(window.getErrorMessageFromErrorCode(ret))
            errorArea.show()
        })
})

