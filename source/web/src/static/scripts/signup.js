$(function () {

    //Pre-enter invation code if url contains
    var invitationCode = window.team.getQuery('invitation_code', location.href)
    if(invitationCode !== ''){
        $('form[name=register]').find('input[name=invitation_code]').val(invitationCode)
    }

    function showRecaptcha(containerId) {
        if($('#' + containerId).find('a img').length){
            $('#' + containerId).find('a img').hide()
        }
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

    showRecaptcha('captcha_div')

    window.refreshCaptcha = function () {
        showRecaptcha('captcha_div')
    }

    var errorArea = $('form[name=register]').find('.errorMessage')
    $('form[name=register]').submit(function (e) {
        e.preventDefault()
        ga('send', 'event', 'signup', 'click', 'signup-submit')
        errorArea.hide()

        var valid = $.validate(this, {onError: function (dom, validator, index) {
            errorArea.text(window.getErrorMessage(dom.name, validator))
            errorArea.show()
        }})

        if (!valid) {
            return
        }

        // Check if user agree to terms
        if (!$('.terms-check').is(':checked')){
            errorArea.text(window.getErrorMessage('terms', 'check'))
            errorArea.show()
            return
        }

        var params = $(this).serializeObject()
        params.phone = '+' + params.country_code +params.phone
        params.country = window.team.getCountryFromPhoneCode(params.country_code)
        delete params.country_code
        if(_.isEmpty(params.invitation_code) || params.invitation_code === ''){
            delete params.invitation_code
        }else {
            // Trim all whitespace inside string
            params.invitation_code = params.invitation_code.replace(/ /g, '')
        }
        params.password = Base64.encode(params.password)
        $.betterPost('/api/1/user/register', params)
            .done(function (result) {
                ga('send', 'event', 'signup', 'result', 'signup-success')
                window.project.goToVerifyPhone(true)
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
