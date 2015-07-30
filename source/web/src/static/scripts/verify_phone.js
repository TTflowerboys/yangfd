(function () {
    var $phoneInupt = $('[name=phone]')
    var $errorMsg = $('.errorMessage')
    var $getCodeBtn = $('.getCode')
    var $verifyBtn = $('.verifyBtn')
    var isPhoneValid = true
    $('.phoneRow').bind('click', function () {
       $(this).find('.phoneReadonly').hide().next('.phoneEdit').show()
    })
    requestSmsCode() //页面载入即自动发送验证码
    $getCodeBtn.bind('click', function () {
        if(!$getCodeBtn.attr('disabled') && isPhoneValid) {
            requestSmsCode()
        }
    })
    $verifyBtn.bind('click', function () {
        var code = $('[name=code]').val()
        var params = {
            code: code
        }
        $errorMsg.hide()
        if (/^(\d){6}$/.test(code)) {
            $.betterPost('/api/1/user/' + window.user.id + '/sms_verification/verify', params)
                .done(function (data) {
                    window.user = data
                    $errorMsg.text(window.i18n('验证成功'))
                    $errorMsg.show()
                    window.project.goToIntention()
                })
                .fail(function (ret) {
                    $errorMsg.text(window.i18n('验证失败'))
                    $errorMsg.show()
                })
                .always(function () {

                })
        } else {
            $errorMsg.text(window.i18n('验证码为6位数字，请填写正确后再验证')).show()
        }
    })
    function requestSmsCode () {
        $getCodeBtn.prop('disabled', true)
        var originParams
        if(window.user && window.user.country) {
            originParams = {
                country: window.user.country.code,
                phone: window.user.phone
            }
        }
        var params = {
            country: $('[name=country]').val(),
            phone: $('[name=phone]').val()
        }
        if (_.isEqual(originParams, params)) {//如果电话号码没改过，则直接发验证码，否则需要重设用户的电话号码
            sendSms()
        } else {
            editUser()
        }
        function editUser() {
            $.betterPost('/api/1/user/edit', params)
                .done(function () {
                    sendSms()
                })
                .fail(function (ret) {
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
            country: $('[name=country]').val(),
            phone: $('[name=phone]').val()
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