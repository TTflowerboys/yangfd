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
                    var phone = val
                    $($('.hostPhone span')[1]).text(phone)
                    $('.contactRequest').hide()
                })
            //TODO: issue #6317
            //.fail(function () {})
        }
        else {
            $('#contactRequestBtn').hide()
            $('.contactRequestForm').show()
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
            $requestSMSCodeBtn.prop('disabled', true)
            $requestSMSCodeBtn.text(window.i18n('发送中...'))

            var params = $contactRequestForm.serializeObject({
                noEmptyString: true,
                exclude: ['code','rent_id']
            })
            $.betterPost('/api/1/user/fast-register', params)
                .done(function (val) {
                    window.user = val
                    //ga('send', 'event', 'signup', 'result', 'signup-success')
                    //TODO: Count down 1 min to enable resend
                    //$requestSMSCodeBtn.prop('disabled', true)
                })
                .fail(function (ret) {
                    $feedback.empty()
                    $feedback.append(window.getErrorMessageFromErrorCode(ret))
                    $feedback.show()
                    //refresh it for may user submit fail, or submit again with another account

                    //ga('send', 'event', 'signup', 'result', 'signup-failed', window.getErrorMessageFromErrorCode(ret))
                    $requestSMSCodeBtn.text(window.i18n('重新发送'))
                    $requestSMSCodeBtn.prop('disabled', false)
                })
        }
    })

    $contactRequestForm.submit(function (e) {
        e.preventDefault()
        //ga('send', 'event', 'property_detail', 'submit', 'requirement-submit')
        $submit.prop('disabled', true)
        $feedback.hide()
        var params = $(this).serializeObject({
            exclude: ['nickname','email','country','phone','rent_id']
        })

        var api = '/api/1/user/' + window.user.id + '/sms_verification/verify'
        $.betterPost(api, params)
            .done(function () {
                $feedback.show().text($(this).attr('data-message-success'))

                $requestContactBtn.click()
                //ga('send', 'event', 'property_detail', 'result', 'requirement-submit-success')
            })
            .fail(function (errorCode) {
                $feedback.empty()
                $feedback.append(window.getErrorMessageFromErrorCode(errorCode, api))
                $feedback.show()
                //ga('send', 'event', 'property_detail', 'click', 'requirement-submit-failed',
                //    window.getErrorMessageFromErrorCode(errorCode, api))
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