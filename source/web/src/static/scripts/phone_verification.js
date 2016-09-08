(function (module) {

    module.setupSmsVerification = function (onSendSuccess, onSendFail, onTimerUpdate, onTimerClear) {
        function sendSms (phone) {
            $.betterPost('/api/1/user/sms_verification/send', {phone: phone})
                .done(function () {
                    onSendSuccess()
                    countDown()
                })
                .fail(function (ret) {
                    onSendFail(ret)
                })
        }

        //倒计时60s后再将获取验证码按钮变为可用状态
        function countDown () {
            var time = 60
            function update() {
                if(time === 0) {
                    onTimerClear()

                } else{
                    onTimerUpdate(time--)
                    setTimeout(update, 1000)
                }
            }
            update()
        }

        return sendSms
    }

    module.smsManullyVerify = function (userId, code,verify_method) {
        return $.betterPost('/api/1/user/' + userId + '/sms_verification/verify', {code: code, verify_method: verify_method})
    }

    module.setupVoiceVerification = function (onSendSuccess, onSendFail, onTimerUpdate, onTimerClear, onVerificationSuccess) {
        function sendVoiceVerification(phone) {
            var params = {
                phone: phone,
                verify_method: 'call'
            }
            $.betterPost('/api/1/user/sms_verification/send', params)
                .done(function (val) {
                    onSendSuccess()
                    startVerificationTimer()
                    startCheckVoiceVerfication(phone)
                })
                .fail(function (ret) {
                    onSendFail(ret)
                })
                .always(function () {
                })
        }

        var xhr = null
        function startCheckVoiceVerfication(phone) {
            //abort request when user retry the verification
            if (xhr && xhr.readyState !== 4) {
                xhr.abort()
            }
            xhr = $.get('/api/1/user/sms_verfication/sinch_call_check', {phone: phone})
                .success(function (data) {
                    if (data.ret === 0) {
                        onVerificationSuccess()
                    } else {
                        startCheckVoiceVerfication(phone)
                    }
                }).fail(function (xhr) {
                    if (xhr.statusText !== 'abort') {
                        startCheckVoiceVerfication(phone)
                    }
                })

        }

        function startVerificationTimer() {
            var sec = 60
            var timer = setInterval(function(){
                if(sec === 0){
                    onTimerClear()
                    clearInterval(timer)
                }
                else {
                    onTimerUpdate(sec)
                    sec--
                }
            },1000)
        }
        
        return sendVoiceVerification
    }

})(window.currantModule = window.currantModule || {})
