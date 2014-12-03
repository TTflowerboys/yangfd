$('#login').click(function () {
    if (team.isPhone()) {
        window.project.goToSignIn()

        ga('send', 'event', 'signin', 'click', 'signin-mobile-entry')
    }else {
        window.project.showSignInModal()

        ga('send', 'event', 'signin', 'click', 'signin-web-entry')
    }


});

$('#modal_shadow').click(function () {
    $('#modal_shadow').hide()
    $('#modal').hide()
});

var errorArea = $('form[name=signin]').find('.errorMessage')
$('form[name=signin]').submit(function (e) {
    ga('send', 'event', 'signin', 'click', 'signin-submit')

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

            ga('send', 'event', 'signin', 'result', 'signin-success')
        })
        .fail(function (ret) {
            errorArea.empty()
            errorArea.append(window.getErrorMessageFromErrorCode(ret))
            errorArea.show()

            ga('send', 'event', 'signin', 'result', 'signin-failed',window.getErrorMessageFromErrorCode(ret))
        })
})

