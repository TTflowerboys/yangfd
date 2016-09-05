(function () {
    var $phoneInupt = $('[name=phone]')
    var $errorMsg = $('.errorMessage')
    var $getCodeBtn = $('.getCode')
    var $verifyBtn = $('.verifyBtn')
    var $goToNextBtn = $('.goToNextBtn')
    var $hint = $('.formsHint')
    var isPhoneValid = true
    $('.phoneRow').bind('click', function () {
        $hint.show()
        $(this).find('.phoneReadonly').hide().next('.phoneEdit').show()
    })
    
    //requestSmsCode() //页面载入即自动发送验证码
    $getCodeBtn.bind('click', function () {
        if(!$getCodeBtn.attr('disabled') && isPhoneValid) {
            requestSmsCode()
        }
    })

    function sendVoiceVerification() {
        $errorMsg.hide()

        var params = {
            phone: '+' + $('[name=country_code]').val() + $('[name=phone]').val(),
            verify_method: 'call'
        }

        $.betterPost('/api/1/user/sms_verification/send', params)
            .done(function (val) {
                $errorMsg.text(window.i18n('发送成功'))
                $errorMsg.show()
                $verifyBtn.hide()
                $goToNextBtn.hide()
                startVerificationTimer()
                startCheckVoiceVerfication()
            })
            .fail(function (ret) {
                window.dhtmlx.message({type:'error', text: window.i18n('发送成功')})
                $errorMsg.text(window.i18n('发送成功'))
                $errorMsg.show()
            })
            .always(function () {
            })
    }
    
    $verifyBtn.bind('click', sendVoiceVerification)

    function goToNext() {
        window.user.phone_verified = true

        if(window.team.getQuery('from').indexOf('intention') >= 0){
            if(window.bridge !== undefined && window.user && window.user.user_type && window.user.user_type.length) {
                window.bridge.callHandler('login', window.user);
            }
        } else {
            if(window.bridge !== undefined && window.user){
                window.bridge.callHandler('updateUser', window.user);
            }
        }
        
        if(window.user && window.user.user_type && window.user.user_type.length){
            var affiliateType = _.find(window.user.user_type, function (oneType) {
                return oneType.slug === 'affiliate'
            })
            if (affiliateType) {
                location.href = '/user-invite'
            }
            else {
                location.href = '/'
            }
        }
        else {
            window.project.goBackFromURL()
        }
    }

    $goToNextBtn.bind('click', goToNext())

    function startCheckVoiceVerfication() {
        var params = {
            phone: '+' + $('[name=country_code]').val() + $('[name=phone]').val()
        }
        $.betterGet('/api/1/user/sms_verfication/sinch_call_check', params)
            .done(function (val) {
                $errorMsg.text(window.i18n('验证成功'))
                $errorMsg.show()
                $verifyBtn.hide()
                $goToNextBtn.show()
            })
            .fail(function (ret) {
                startCheckVoiceVerfication()
            })
    }

    function startVerificationTimer() {
        var $form = $('.formWrap')
        $form.find('#voiceVerification').hide()
        $form.find('#voiceHint').show()
        var sec = 60
        var timer = setInterval(function(){
            if(sec === 0){
                $form.find('#voiceHint').html(window.i18n('请按照语音提示操作（默认按手机键盘上数字1即可验证成功），如果没有接到联系电话，请') +  window.i18n('<a id="voiceVerification" class="voiceVerification">重试</a>'))
                $form.find('#voiceHint #voiceVerification').click(sendVoiceVerification)
                clearInterval(timer)
            }
            else {
                $form.find('#voiceHint').text(window.i18n('请按照语音提示操作（默认按手机键盘上数字1即可验证成功），如果没有接到联系电话，请') + sec + window.i18n('s 后重试'))
                sec--
            }
        },1000)
    }

    function requestSmsCode () {
        $getCodeBtn.prop('disabled', true)
        var originParams
        if(window.user && window.user.country) {
            originParams = {
                phone:'+' + window.user.country_code + window.user.phone
            }
        }
        var params = {
            phone: '+' + $('[name=country_code]').val() + $('[name=phone]').val()
        }
        if (_.isEqual(originParams, params)) {//如果电话号码没改过，则直接发验证码，否则需要重设用户的电话号码
            sendSms()
        } else {
            editUser()
        }
        function editUser() {
            $.betterPost('/api/1/user/edit', params)
                .done(function (val) {
                    window.user = val
                    sendSms()
                })
                .fail(function (ret) {
                    $('.buttonLoading').trigger('end')
                    window.dhtmlx.message({type:'error', text: window.getErrorMessageFromErrorCode(ret)})
                    $errorMsg.html(window.getErrorMessageFromErrorCode(ret)).show()
                    $getCodeBtn.prop('disabled', false).text(i18n('重新获取验证码'))
                })
        }
        function sendSms () {
            $.betterPost('/api/1/user/sms_verification/send', params)
                .done(function () {
                    $errorMsg.text(i18n('验证码已成功发送到您填写的手机号')).show()
                })
                .fail(function (ret) {
                    window.dhtmlx.message({type:'error', text: window.getErrorMessageFromErrorCode(ret)})
                    $errorMsg.text(window.getErrorMessageFromErrorCode(ret)).show()
                })
                .always(function () {
                    $('.buttonLoading').trigger('end')
                    countDown()
                })
        }
    }
    //倒计时60s后再将获取验证码按钮变为可用状态
    function countDown () {
        var text = i18n('{time}s后可再次获取')
        var time = 60
        function update() {
            if(time === 0) {
                $getCodeBtn.prop('disabled', false).text(i18n('重新获取验证码'))
            } else{
                $getCodeBtn.prop('disabled', true).text(text.replace('{time}', time--))
                setTimeout(update, 1000)
            }
        }
        update()
    }
    function enableSubmitButton (enable) {
        var button = $('button[type=submit]')
        if (enable) {
            button.prop('disabled', false);
            button.removeClass('gray').addClass('red')
        }
        else {
            button.prop('disabled', true);
            button.removeClass('red').addClass('gray')
        }
    }
    var onPhoneNumberChange = function () {
        var params = {
            phone: '+' + $('[name=country_code]').val() + $('[name=phone]').val()
        }
        if (params.phone) {
            enableSubmitButton(false)
            $.betterPost('/api/1/user/phone_test', params)
                .done(function () {
                    isPhoneValid = true
                    $errorMsg.hide()
                    $phoneInupt.css('border', '')
                    enableSubmitButton(true)
                })
                .fail(function () {
                    isPhoneValid = false
                    window.dhtmlx.message({type:'error', text: window.getErrorMessage('phone', 'number')})
                    $errorMsg.text(window.getErrorMessage('phone', 'number'))
                    $errorMsg.show()
                    $phoneInupt.css('border', '2px solid red')
                })
        }
        else {
            $errorMsg.hide()
            $phoneInupt.css('border', '')
            enableSubmitButton(true)
        }
    }
    $phoneInupt.on('change', onPhoneNumberChange)
})()
