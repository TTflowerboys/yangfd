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

// ErrorMessage[0] is target for signin page which response to error code from url
var errorArea = $($('form[name=signin]').find('.errorMessage')[1])

$('form[name=signin]').submit(function (e) {
    e.preventDefault()
    ga('send', 'event', 'signin', 'click', 'signin-submit')
    errorArea.hide()
    var valid = $.validate(this, {onError: function (dom, validator, index) {
        errorArea.text(window.getErrorMessage(dom.name, validator))
        errorArea.show()
    }})
    if (!valid) {return}

    var params = $(this).serializeObject()
    params.phone = '+' + params.country_code +params.phone
    delete params.country_code
    params.password = Base64.encode(params.password)
    $.betterPost('/api/1/user/login', params)
        .done(function () {
            if(window.signinSuccessCallback && _.isFunction(window.signinSuccessCallback)) {
                window.signinSuccessCallback()
                    .then(function () {
                        location.reload()
                    })
            } else {
                location.reload()
            }
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

