var $form = $('form[name=changePhone2]')

function startVerificationTimer() {
    $form.find('#voiceVerification').hide()
    $form.find('#voiceHint').show()
    var sec = 60
    var timer = setInterval(function(){
        if(sec === 0){
            $form.find('#voiceHint').html(window.i18n('请按照语音提示操作（默认按手机键盘上数字1即可验证成功），如果没有接到联系电话，请重试'))
            $form.find('#voiceHint #voiceVerification').click(sendVoiceVerification)
            clearInterval(timer)
        }
        else {
            $form.find('#voiceHint').text(window.i18n('请按照语音提示操作（默认按手机键盘上数字1即可验证成功），如果没有接到联系电话，请') + sec + window.i18n('s 后重试'))
            sec--
        }
    },1000)
}

function sendVoiceVerification(e) {
    e.preventDefault()
    
    var phone = window.user.phone
    var errorArea = $(this).find('.resultMessage')
    
    if (phone) {
        $form.find('.phoneIndicator').show();
        errorArea.text(window.i18n('发送中...'))
        errorArea.show()

        var params = $form.serializeObject()
        var theParams = {}
        theParams.phone = '+' + params.country_code + params.phone
        theParams.verify_method = 'call'
        $.betterPost('/api/1/user/sms_verification/send', theParams)
            .done(function (val) {
                errorArea.text(window.i18n('发送成功'))
                startVerificationTimer()
                startCheckVoiceVerfication()
            })
            .fail(function (ret) {
                errorArea.text(window.getErrorMessageFromErrorCode(ret))
            })
            .always(function () {
                $form.find('.phoneIndicator').hide();
            })
    }
    else {
        errorArea.text(window.i18n('手机不能为空'))
        errorArea.show()
    }
}

function startCheckVoiceVerfication() {
    var errorArea = $(this).find('.resultMessage')
    var params = $form.serializeObject()
    var phone = '+' + params.country_code + params.phone
    $.betterGet('/api/1/user/sms_verfication/sinch_call_check', {phone: phone})
        .done(function (val) {
            errorArea.text(window.i18n('验证成功'))
            errorArea.show()
            location.href = '/user-settings'
        })
        .fail(function (ret) {
            startCheckVoiceVerfication()
        })
}


$('form[name=changePhone2]').submit(sendVoiceVerification)

$('.rmm-button').removeClass('rmm-button-user').addClass('rmm-button-user-settings')

if (team.isPhone()) {
    $('input[name=code]').attr('placeholder',window.i18n('手机验证码'))
}
