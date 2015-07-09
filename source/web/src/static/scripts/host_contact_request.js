$(function () {
    var rentId = $('input[name=rent_id]').val()

    var $requestContactBtn = $('#contactRequestBtn')
    var $contactRequestForm = $('form[name=contactRequestForm]')
    var $requestSMSCodeBtn = $contactRequestForm.find('[name=getCodeBtn]')
    var $submit = $contactRequestForm.find('[type=submit]')
    var $feedback = $contactRequestForm.find('[data-role=serverFeedback]')

    /*
     * Control request contact button based on user login or not
     * */
    $requestContactBtn.on('click', function (e) {
        if (window.user && rentId) {
            $.betterPost('/api/1/rent_ticket/' + rentId + '/contact_info')
                .done(function (val) {
                    var host = val
                    if(host.private_contact_methods.indexOf('phone') < 0) {
                        $('.hostPhone').addClass('show').find('span').eq(1).text(host.phone)
                        $('.hostPhone a').attr('href', 'tel:+' + host.country_code + host.phone)
                    } else {
                        $('.hostPhone').removeClass('show')
                    }
                    if(host.private_contact_methods.indexOf('email') < 0) {
                        $('.hostEmail').addClass('show').find('span').text(host.email)
                        $('.hostEmail a').attr('href', 'mailto:' + host.email)
                    } else {
                        $('.hostEmail').removeClass('show')
                    }
                    if(host.private_contact_methods.indexOf('wechat') < 0) {
                        $('.hostWechat').addClass('show').find('span').text(host.wechat)
                    } else {
                        $('.hostWechat').removeClass('show')
                    }
                    $('.host .hint').fadeOut()
                    //issue #7021 触碰到了获取房东联系上限时弹出求租需求单填写框
                    if(host.wechat === 'yangfd1') {
                        window.openRequirementRentForm({
                            requestContact: 'true',
                            ticketId: rentId
                        })
                    }

                    $('.hostName').text(host.nickname)

                    $('.contactRequest').hide()
                    $('body,html').animate({scrollTop: $('#host').offset().top}, 300)

                    ga('send', 'pageview', '/host-contact-request/'+ rentId + '/contact-show-success')
                })
                .fail(function (ret) {
                    $('.host .hint').fadeOut()
                    $feedback.empty()
                    $feedback.append(window.getErrorMessageFromErrorCode(ret))
                    $feedback.show()

                    ga('send', 'event', 'request_host_contact', 'error', 'request-host-contact-failed', window.getErrorMessageFromErrorCode(ret))
                })
        }
        else {
            $('#contactRequestBtn').hide()
            $('.contactRequestForm').show()

            ga('send', 'pageview', '/host-contact-request/'+ rentId)
        }
    })

    /*
     *  Get sms verfication code
     * */
    $requestSMSCodeBtn.on('click', function (e) {
        // Check email and phone
        var valid = $.validate($contactRequestForm, {
            onError: function (dom, validator, index) {
                $feedback.empty()
                $feedback.append(window.getErrorMessage(dom.name, validator))
                $feedback.show()
            },
            exclude: ['code']
        })

        // Fast register user
        if (valid) {
            ga('send', 'pageview', '/host-contact-request/'+ rentId + '/request-sms')

            $requestSMSCodeBtn.prop('disabled', true)
            $requestSMSCodeBtn.text(window.i18n('发送中...'))

            var params = $contactRequestForm.serializeObject({
                noEmptyString: true,
                exclude: ['code','rent_id']
            })
            $.betterPost('/api/1/user/fast-register', params)
                .done(function (val) {
                    //Clear any feedback before
                    $feedback.empty()

                    window.user = val
                    ga('send', 'pageview', '/host-contact-request/'+ rentId + '/user-create-success')

                    //Unbind fast-register api call from send button
                    $requestSMSCodeBtn.off('click')

                    //Count down 1 min to enable resend
                    var sec = 60
                    var countdown = setInterval(function(){
                        $requestSMSCodeBtn.text(sec + 's')
                        if(sec === 0){
                            //Stop interval
                            clearInterval(countdown)

                            //Reable send button
                            $requestSMSCodeBtn.prop('disabled', false)
                            $requestSMSCodeBtn.text(window.i18n('重新发送'))

                            //Re-bind sms verification send api to resend button
                            $requestSMSCodeBtn.on('click',function(e){
                                ga('send', 'event', 'request_host_contact', 'sms-verify', 're-send')
                                $.betterPost('/api/1/user/sms_verification/send', {
                                    phone:window.user.phone,
                                    country:window.user.country.code
                                }).done(function (val) {
                                    //Disable re-send sms for re-send
                                    $requestSMSCodeBtn.prop('disabled', true)

                                    var sec = 60
                                    var countdown = setInterval(function(){
                                        $requestSMSCodeBtn.text(sec + 's')
                                        if(sec === 0){
                                            //Stop interval
                                            clearInterval(countdown)

                                            $requestSMSCodeBtn.prop('disabled', false)
                                            $requestSMSCodeBtn.text(window.i18n('重新发送'))
                                        }
                                        sec--
                                    },1000)
                                }).fail(function (ret) {
                                    $feedback.empty()
                                    $feedback.append(window.getErrorMessageFromErrorCode(ret))
                                    $feedback.show()
                                    //refresh it for may user submit fail, or submit again with another account

                                    ga('send', 'event', 'request_host_contact', 'error', 'send-sms-failed', window.getErrorMessageFromErrorCode(ret))
                                    $requestSMSCodeBtn.text(window.i18n('重新发送'))
                                    $requestSMSCodeBtn.prop('disabled', false)
                                })
                            })
                        }
                        sec--
                    },1000)
                })
                .fail(function (ret) {
                    $feedback.empty()
                    $feedback.append(window.getErrorMessageFromErrorCode(ret))
                    $feedback.show()

                    ga('send', 'event', 'request_host_contact', 'error', 'fast-register-failed', window.getErrorMessageFromErrorCode(ret))
                    $requestSMSCodeBtn.text(window.i18n('重新发送'))
                    $requestSMSCodeBtn.prop('disabled', false)
                })
        }
    })

    $contactRequestForm.submit(function (e) {
        e.preventDefault()
        $submit.prop('disabled', true)
        $feedback.hide()
        var params = $(this).serializeObject({
            exclude: ['nickname','email','country','phone','rent_id']
        })

        var api = '/api/1/user/' + window.user.id + '/sms_verification/verify'
        $.betterPost(api, params)
            .done(function () {
                ga('send', 'pageview', '/host-contact-request/'+ rentId + '/phone-verify-success')

                $feedback.show().text($(this).attr('data-message-success'))

                $requestContactBtn.click()
            })
            .fail(function (ret) {
                $feedback.empty()
                $feedback.append(window.getErrorMessageFromErrorCode(ret))
                $feedback.show()
            })
            .always(function () {
                $submit.prop('disabled', false)
            })

    }).on('change blur keyup', '[name]', function (e) {
        var valid = $.validate($contactRequestForm, {onError: function () { }})
        if (valid && window.user) {
            $contactRequestForm.find('[type=submit]').prop('disabled', false)
        } else {
            $contactRequestForm.find('[type=submit]').prop('disabled', true)
        }
    })


    // Init contact request section based on url params
    // If url have 'requestContact = true', means init with request contact button clicked
    var initRequestContact = team.getQuery('requestContact')
    if(initRequestContact){
        $requestContactBtn.click()
        //window.location.hash = 'contactRequest'
    }


})