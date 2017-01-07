(function () {
    var $phoneInupt = $('[name=phone]')
    var $errorMsg = $('.errorMessage')
    var isPhoneValid = true
    $('.phoneRow').bind('click', function () {
        $(this).find('.phoneReadonly').hide().next('.phoneEdit').show()
    })


    
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

    $('.goToNextBtn').on('click', goToNext)

     function editUserAndVerification(verifyFunc) {
        function isPhoneEdited() {
            var originParams
            if(window.user && window.user.country) {
                originParams = {
                    phone:'+' + window.user.country_code + window.user.phone
                }
            }
            var params = {
                phone: '+' + $('[name=country_code]').val() + $('[name=phone]').val()
            }
            return !_.isEqual(originParams, params)
        }

        function editUser() {
            var params = {
                phone: '+' + $('[name=country_code]').val() + $('[name=phone]').val()
            }
            $.betterPost('/api/1/user/edit', params)
                .done(function (val) {
                    window.user = val
                    verifyFunc('+' + $('[name=country_code]').val() + $('[name=phone]').val())
                })
                .fail(function (ret) {
                    $('.buttonLoading').trigger('end')
                    window.dhtmlx.message({type:'error', text: window.getErrorMessageFromErrorCode(ret)})
                    $errorMsg.html(window.getErrorMessageFromErrorCode(ret)).show()
                })
        }

        $errorMsg.hide()

        if (isPhoneEdited()) {
            editUser()
        }
        else {
            verifyFunc('+' + $('[name=country_code]').val() + $('[name=phone]').val())
        }
    }

    var smsCount = 0
    var sendSmsVerification = window.currantModule.setupSmsVerification(function () {
        $errorMsg.text(i18n('验证码已成功发送到您填写的手机号')).show()
        $('.buttonLoading').trigger('end')
        $getCodeBtn.prop('disabled', true)
        smsCount++
    }, function (ret) {
        window.dhtmlx.message({type:'error', text: window.getErrorMessageFromErrorCode(ret)})
        $errorMsg.text(window.getErrorMessageFromErrorCode(ret)).show()
        $('.buttonLoading').trigger('end')
        smsCount++
    }, function (sec) {
        var text = i18n('{time}s后可再次获取', {time: sec--})
        $getCodeBtn.prop('disabled', true).text(text)
    }, function () {
        $getCodeBtn.prop('disabled', false).text(i18n('重新获取验证码'))
        if (smsCount > 1) {
            //use voice 验证
            $('.tryVoiceVerification').show()
            $('#tryVoiceVerificationButton').click(function (e) {
                $('.smsVerificationSection').hide()
                $('.voiceVerificationSection').show()
                setTimeout(function () {
                    $('.verifyBtn.voice').click()
                }, 500)
            })
        }
    })

    var smsManullyVerify = window.currantModule.smsManullyVerify
    var $getCodeBtn = $('.getCode')
    $getCodeBtn.bind('click', function () {
        if(!$getCodeBtn.attr('disabled') && isPhoneValid) {
            editUserAndVerification(sendSmsVerification)
        }
    })

    $('.verifyBtn.sms').on('click', function (e) {
        var code = $('[name=code]').val()
        smsManullyVerify(window.user.id, code, 'sms')
            .done(function (data) {
                window.user.phone_verified = true
                $errorMsg.text(window.i18n('验证成功'))
                $errorMsg.show()
                $('.verifyBtn.sms').hide()
                //$('.goToNextBtn.sms').show()
                goToNext();
            })
            .fail(function (ret) {
                window.dhtmlx.message({type:'error', text: window.i18n('验证失败')})
                $errorMsg.text(window.i18n('验证失败'))
                $errorMsg.show()
            })
    })

    var sendVoiceVerification =  window.currantModule.setupVoiceVerification(function () {
        $errorMsg.text(window.i18n('发送成功'))
        $errorMsg.show()
        $('.verifyBtn.voice').hide()
        $('.goToNextBtn.voice').hide()
    }, function (ret) {
        window.dhtmlx.message({type:'error', text: window.getErrorMessageFromErrorCode(ret)})
        $errorMsg.html(window.getErrorMessageFromErrorCode(ret)).show()
    }, function (sec) {
        var $form = $('.formWrap')
        var stringTemplate = window.i18n('请按照语音提示操作（默认按手机键盘上数字1即可验证成功），如果没有接到联系电话，请{sec}s后重试', {sec: sec})        $form.find('#voiceHint').text(stringTemplate).show()
    }, function () {
        var $form = $('.formWrap')
        $form.find('#voiceHint').html(window.i18n('请按照语音提示操作（默认按手机键盘上数字1即可验证成功），如果没有接到联系电话，请重试')).show()
        $('.verifyBtn.voice').show()
    }, function () {
        smsManullyVerify(window.user.id, 'call', 'call')
            .done(function (data) {
                window.user.phone_verified = true
                $('.verifySuccess').show()
                $('.verifyBtn.voice').hide()
                $('.goToNextBtn.voice').show()
            })
            .fail(function (ret) {
                window.dhtmlx.message({type:'error', text: window.i18n('验证失败')})
                $errorMsg.text(window.i18n('验证失败'))
                $errorMsg.show()
            })
    })

    $('.verifyBtn.voice').on('click', function(e) {
        editUserAndVerification(sendVoiceVerification)
    })

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

    //start automatically
    $getCodeBtn.click()
})()
