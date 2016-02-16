/**
 * Created by zhou on 14-12-9.
 */
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

    // function getRecaptchaChallenge() {
    //     return $('form[name=register]').find('input[name=challenge]').val()
    // }

    // function getRecaptchaResponse() {
    //     return $('form[name=register]').find('input[name=code]').val()
    // }


    showRecaptcha('captcha_div')

    window.refreshCaptcha = function () {
        showRecaptcha('captcha_div')
    }

    var errorArea = $('form[name=register]').find('.errorMessage')
    $('form[name=register]').submit(function (e) {
        e.preventDefault()
        ga('send', 'event', 'sign_up_vip', 'click', 'sign_up_vip-submit')
        errorArea.hide()

        var valid = $.validate(this, {
            onError: function (dom, validator, index) {
                window.dhtmlx.message({type:'error', text: window.getErrorMessage(dom.name, validator)})
                errorArea.text(window.getErrorMessage(dom.name, validator))
                errorArea.show()
            }
        })

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
        params.password = Base64.encode(params.password)
        //params.challenge = getRecaptchaChallenge()
        //params.solution = getRecaptchaResponse()
        params.is_vip = true
        $.betterPost('/api/1/user/register', params)
            .done(function () {
                ga('send', 'event', 'sign_up_vip', 'result', 'sign_up_vip-success')

                window.project.goToIntention()
            }).fail(function (ret) {
                errorArea.empty()
                window.dhtmlx.message({type:'error', text: window.getErrorMessageFromErrorCode(ret)})
                errorArea.append(window.getErrorMessageFromErrorCode(ret))
                errorArea.show()
                //refresh it for may user submit fail, or submit again with another account

                ga('send', 'event', 'sign_up_vip', 'result', 'sign_up_vip-failed',
                    window.getErrorMessageFromErrorCode(ret))
                showRecaptcha('captcha_div')
            }).always(function () {
            })
    })
})
