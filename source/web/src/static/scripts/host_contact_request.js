$(function () {
    var rentId = $('input[name=rent_id]').val()

    var $requestContactBtn = $('#contactRequestBtn')
    var $contactRequestForm = $('form[name=contactRequestForm]')
    var $requestSMSCodeBtn = $contactRequestForm.find('[name=getCodeBtn]')
    var $submit = $contactRequestForm.find('[type=submit]')
    var $feedback = $contactRequestForm.find('[data-role=serverFeedback]')
    var $hint = $requestContactBtn.find('.hint')
    var $residueDegree = $requestContactBtn.find('.residueDegree')
    var $exhaustSubmitTip = $requestContactBtn.find('.exhaustSubmitTip')
    var $shareAppModal = $('.shareAppModal')
    var $downloadAppModal = $('.downloadAppModal')

    //Init residue degree
    getResidueDegree()

    function initDisplayOfElement () { //根据data-show-client初始化元素在不同客户端的显示或隐藏状态
        $('[data-show-client]').each(function () {
            var $this = $(this)
            var client = window.team.getClient()
            var showClient = $this.attr('data-show-client')
            $this.css('display','')
            if(showClient.split(',').indexOf(client) < 0) {
                $this.hide()
            }
        })
    }
    function shareSuccessCallback () {
        //call increment count api
        $.betterPost('/api/1/credit/view_rent_ticket_contact_info/share_app_completed')
            .done(function () {
                getContactInfo()
            })
            .fail(function (ret) {
                $hint.text(window.getErrorMessageFromErrorCode(ret))
            })
            .always($.modal.close)
    }
    function shareAppToWeibo() {
        window.WB2.anyWhere(function(W){
            W.widget.publish({
                'id' : 'shareAppToWeibo',
                'default_image':'http://upload.yangfd.com/app_icon_x120_150427.png',
                'default_text' : window.i18n('发现一个很不错的海外出租，求租的东东，小伙伴们不用谢！大家好才是真的好！ http://yangfd.com/app-download'),
                //'action': 'publish',
                'position':'c',
                'callback' : function(o) {
                    shareSuccessCallback()
                }
            });
        });
    }
    function shareAppToCircle() {
        $('#shareAppToCircle').off('click').on('click', function () {
            window.wechatShareSDK.init({
                title: window.i18n('发现一个很不错的海外出租，求租的东东，小伙伴们不用谢！大家好才是真的好！'),
                link: 'http://yangfd.com/app-download',
                imgUrl: 'http://upload.yangfd.com/app_icon_x120_150427.png',
                desc: window.i18n('发现一个很不错的海外出租，求租的东东，小伙伴们不用谢！大家好才是真的好！'),
                success:function(){
                    $('.guideLine').hide()
                    shareSuccessCallback()
                },
                cancel:function(){
                    $('.guideLine').hide()
                    //todo 微信中取消了分享
                }
            }, {
                appMessage: {
                    success:function(){
                        $('.guideLine p').text(window.i18n('[分享到朋友圈]才有效'))
                    }
                },
                qq: {
                    success:function(){
                        $('.guideLine p').text(window.i18n('[分享到朋友圈]才有效'))
                    }
                }
            })
        })
    }
    function shareApp() {
        var client = window.team.getClient()
        if(client === 'app') {
            return $('#shareApp').off('click').on('click', function () {
                ga('send', 'event', 'request_host_contact', 'click', 'share_in_app_for_contact')
                window.bridge.callHandler('share', {'text': window.i18n('发现一个很不错的海外出租，求租的东东，小伙伴们不用谢！大家好才是真的好！'), 'url': 'http://yangfd.com/app-download', 'services': ['Wechat Circle', 'Sina Weibo']}, function(response) {
                    if (response.msg === 'ok') {
                        return shareSuccessCallback()
                    }
                    //todo App中取消分享或者分享失败
                })
            })
        }
        if(client === 'wechat') {
            ga('send', 'event', 'request_host_contact', 'click', 'share_in_wechat_for_contact')
            return shareAppToCircle()
        }
        if(client === 'pc') {
            ga('send', 'event', 'request_host_contact', 'click', 'share_to_weibo_on_pc_for_contact')
            return shareAppToWeibo()
        }

    }
    window.shareAppToGetMoreAmount = function () {
        initDisplayOfElement()
        shareApp()
        $shareAppModal.modal()
    }

    window.downloadAppToGetMoreAmount = function () {
        initDisplayOfElement()
        $downloadAppModal.modal()
    }

    function getResidueDegree() {
        if ($residueDegree.length > 0 && window.user) {
            if(!$requestContactBtn.parents('.host_wrapper').hasClass('contact_info_already_fetched')){
                $.betterPost('/api/1/credit/view_rent_ticket_contact_info/amount')
                    .done(function (val) {
                        $residueDegree.text(val.amount)

                        // If user submitted before, or already pass cooling period since last submit
                        if(val.amount === 0){
                            if(_.findIndex(val.credits,{tag:'rent_intention_ticket'}) < 0){ //尚未提交过出租需求单
                                $hint.html('<span class="exhaustSubmitTip">(' + window.i18n('提交求租需求继续获取') + ')</span>').css('display', 'block')

                                $requestContactBtn.off('click').on('click', function (e) {
                                    window.openRequirementRentForm({
                                        requestContact: 'true',
                                        ticketId: rentId
                                    })
                                    ga('send', 'pageview', '/host-contact-request/'+ rentId)
                                    ga('send', 'event', 'request_host_contact', 'click', 'open-requirement-rent-form-to-contact')
                                })
                            }
                            else if (_.findIndex(val.credits,{tag:'share_app'}) < 0 && !(window.team.isPhone() && !window.team.isWeChat() && !window.team.isCurrantClient())) { //尚未分享过App,并且不是在mobile web
                                $exhaustSubmitTip.text(window.i18n('，分享洋房东App，给大家送福利，分享成功继续获取')).css('display', 'inline')
                                $hint.css('display', 'block')
                                $requestContactBtn.off('click').on('click', function (e) {
                                    window.shareAppToGetMoreAmount()
                                    ga('send', 'pageview', '/host-contact-request/'+ rentId)
                                    ga('send', 'event', 'request_host_contact', 'click', 'open-share-form-to-contact')
                                })
                            }
                            else if (_.findIndex(val.credits,{tag:'download_ios_app'}) < 0 && !window.team.isCurrantClient()) { //尚未下载过App
                                $exhaustSubmitTip.text(window.i18n('，下载洋房东App继续获取')).css('display', 'inline')
                                $hint.css('display', 'block')
                                $requestContactBtn.off('click').on('click', function (e) {
                                    window.downloadAppToGetMoreAmount()
                                    ga('send', 'pageview', '/host-contact-request/'+ rentId)
                                    ga('send', 'event', 'request_host_contact', 'click', 'open-download-app-form-to-contact')
                                })
                            } else{
                                $hint.css('display', 'none')
                            }
                        }
                    })
                    .fail(function (ret) {
                        $requestContactBtn.find('.hint').hide()
                    })
            } else {
                $requestContactBtn.text(window.i18n('查看房东联系方式'))
            }

        } else{
            $requestContactBtn.find('.hint').hide()
        }
    }

    function reduceResidueDegree() {
        if($residueDegree.length > 0 && parseInt($residueDegree.text()) > 0) {
            //$residueDegree.text(parseInt($residueDegree.text()) - 1)
            getResidueDegree()
        }
    }

    function getContactInfo() {
        $.betterPost('/api/1/rent_ticket/' + rentId + '/contact_info')
            .done(function (val) {
                var host = val
                host.private_contact_methods = host.private_contact_methods || []
                if(host.private_contact_methods.indexOf('phone') < 0 && host.phone) {
                    $('.hostPhone').addClass('show').find('span').eq(0).text('+' + host.country_code)
                    $('.hostPhone').addClass('show').find('span').eq(1).text(host.phone)
                    $('.hostPhone a').attr('href', 'tel:+' + host.country_code + host.phone)
                } else {
                    $('.hostPhone').removeClass('show')
                }
                if(host.private_contact_methods.indexOf('email') < 0 && host.email) {
                    $('.hostEmail').addClass('show').find('span').text(host.email)
                    $('.hostEmail a').attr('href', 'mailto:' + host.email)
                } else {
                    $('.hostEmail').removeClass('show')
                }
                if(host.private_contact_methods.indexOf('wechat') < 0 && host.wechat) {
                    $('.hostWechat').addClass('show').find('span').text(host.wechat)
                } else {
                    $('.hostWechat').removeClass('show')
                }
                $('.host .hint').fadeOut()

                $('.hostName').text(host.nickname)

                $('.contactRequest').hide()
                $('body,html').animate({scrollTop: $('#host').offset().top}, 300)

                reduceResidueDegree()

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
    /*
     * Control request contact button based on user login or not
     * */
    $requestContactBtn.on('click', function (e) {
        if (window.user && rentId) {
            getContactInfo()
        }
        else {
            $('#contactRequestBtn').hide().next('.knownMore').hide()
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

})
