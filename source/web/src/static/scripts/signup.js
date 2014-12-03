$(function () {

    function showRecaptcha(containerId) {

        $.betterPost('/api/1/captcha/generate', {})
            .done(function (data) {
                if (data) {
                    $('#' + containerId).empty()
                    $('#' + containerId).append(data)
                }
            })
            .fail(function (ret) {
            })
            .always(function () {

            })

    }

    function getRecaptchaChallenge() {
        return $('form[name=register]').find('input[name=challenge]').val()
    }

    function getRecaptchaResponse() {
        return $('form[name=register]').find('input[name=code]').val()
    }


    showRecaptcha('captcha_div')

    window.refreshCaptcha = function () {
        showRecaptcha('captcha_div')
    }

    var errorArea = $('form[name=register]').find('.errorMessage')
    $('form[name=register]').submit(function (e) {
        ga('send', 'event', 'signup', 'click', 'signup-submit')

        e.preventDefault()
        errorArea.hide()

        var valid = $.validate(this, {onError: function (dom, validator, index) {
            errorArea.text(window.getErrorMessage(dom.name, validator))
            errorArea.show()
        }})

        if (!valid) {
            return
        }

        var params = $(this).serializeObject()
        params.password = Base64.encode(params.password)
        params.challenge = getRecaptchaChallenge()
        params.solution = getRecaptchaResponse()
        $.betterPost('/api/1/user/register', params)
            .done(function () {
                ga('send', 'event', 'signup', 'result', 'signup-success')

                window.project.goToIntention()
            }).fail(function (ret) {
                errorArea.empty()
                errorArea.append(window.getErrorMessageFromErrorCode(ret))
                errorArea.show()
                //refresh it for may user submit fail, or submit again with another account

                ga('send', 'event', 'signup', 'result', 'signup-failed',window.getErrorMessageFromErrorCode(ret))
                showRecaptcha('captcha_div')
            }).always(function () {
            })
    })
})
