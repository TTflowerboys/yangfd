$(function () {

    //Pre-enter invation code if url contains
    var invitationCode = window.team.getQuery('invitation_code', location.href)
    if(invitationCode !== ''){
        $('form[name=register]').find('input[name=invitation_code]').val(invitationCode)
    }

    window.project.showRecaptcha('captcha_div')

    window.refreshCaptcha = function () {
        window.project.showRecaptcha('captcha_div')
    }

    var errorArea = $('form[name=register]').find('.errorMessage')
    $('form[name=register]').submit(function (e) {
        e.preventDefault()
        ga('send', 'event', 'signup', 'click', 'signup-submit')
        errorArea.hide()

        var valid = $.validate(this, {onError: function (dom, validator, index) {
            window.dhtmlx.message({type:'error', text: window.getErrorMessage(dom.name, validator)})
            errorArea.text(window.getErrorMessage(dom.name, validator))
            errorArea.show()
        }})

        if (!valid) {
            return
        }

        // Check if user agree to terms
        if (!$('.terms-check').is(':checked')){
            window.dhtmlx.message({type:'error', text: window.getErrorMessage('terms', 'check')})
            errorArea.text(window.getErrorMessage('terms', 'check'))
            errorArea.show()
            return
        }

        var params = $(this).serializeObject()

        if(window.project.includePhoneOrEmail(params.nickname)) {
            window.dhtmlx.message({type:'error', text: window.i18n('用户名不得包含电话号码或邮箱')})
            errorArea.text(window.i18n('用户名不得包含电话号码或邮箱'))
            errorArea.show()
            return
        }

        params.phone = '+' + params.country_code + params.phone
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
                window.project.goToVerifyPhoneThenIntention()
            }).fail(function (ret) {
                errorArea.empty()
                window.dhtmlx.message({type:'error', text: window.getErrorMessageFromErrorCode(ret)})
                errorArea.append(window.getErrorMessageFromErrorCode(ret))
                errorArea.show()
                //refresh it for may user submit fail, or submit again with another account

                ga('send', 'event', 'signup', 'result', 'signup-failed',window.getErrorMessageFromErrorCode(ret))
                window.project.showRecaptcha('captcha_div')
            }).always(function () {
            })
    })
})
