$(function () {

    function assignReferralCode(doneCallback) {
        $.betterGet('/api/1/user/assign_referral_code', {})
            .done(function (data) {
                $.betterGet('/api/1/user', {})
                    .done(function (data) {
                        window.user = data
                        $('.bonusCode strong').text(window.user.referral_code)
                        if (doneCallback) {
                            doneCallback()
                        }
                    })
                    .fail(function (ret) {
                        window.dhtmlx.message({type: 'error', text: window.i18n('邀请码生成错误请刷新页面后重试')})
                    })
                    .always(function () {

                    })
            })
            .fail(function (ret) {
            })
            .always(function () {

            })
    }

    if (typeof window.user.referral_code === 'undefined') {
        assignReferralCode()
    }

    $('.button.email').on('click',function(){
        var $shareView = $('#emailSharePopup .shareView')
        $shareView.css('top', $(window).scrollTop() + 200)
        $shareView.css('left', ($(window).width() - $shareView.width()) / 2)
        $('#emailSharePopup').show()
    })

    $('.button.social').on('click',function(){

        function showSocialShare() {
            if (window.project.isMobileClient()) {
                window.bridge.callHandler('share', {'text': window.i18n('洋房东 £25租房优惠'), 'description': window.i18n('还在为租房苦恼吗？ 使用我的邀请码在洋房东注册，寻找合适房源，立享优惠！'), 'url': location.origin + '/signup?referral=' + window.user.referral_code, 'services': ['SMS', 'Email', 'Wechat Friend', 'Wechat Circle', 'Sina Weibo', 'Copy Link'], 'wechat_url': location.origin + '/wechat-invite?referral=' + window.user.referral_code}, function(response) {
                })
            }
            else {
                var $shareView = $('#socialSharePopup .shareView')
                $shareView.css('top', $(window).scrollTop() + 200)
                $shareView.css('left', ($(window).width() - $shareView.width()) / 2)
                $('#socialSharePopup')
                    .find('img.qrcode').prop('src', '/qrcode/generate?content=' + encodeURIComponent(location.origin + '/wechat-invite?referral=' + window.user.referral_code)).end()
                    .show()
            }
        }

        if (window.user.referral_code) {
            showSocialShare()
        }
        else {
            assignReferralCode(function () {
                showSocialShare()
            })
        }
    })

    $('.sharePopupShadow').on('click', function () {
        $(this).parent().hide()
    })

    $('#socialSharePopup li.weibo').on('click', function (){
        var params = {'title': window.i18n('发福利啦，需要租房的小伙伴们看过来，点击以下链接注册洋房东在线查看出租房源，租房成功者即可得到£25的租房优惠哦。不要太感谢我，请叫我雷锋，造福大家是我的使命'), 'url': location.origin + '/signup?referral=' + window.user.referral_code}
        team.shareToWeibo(params)
    })

    $('#emailSharePopup .send').on('click', function () {
        var email = $('#emailSharePopup [name=email]').val()

        if (!email || email === '') {
            return false
        }

        if(!window.project.emailReg.test(email)) {
            window.dhtmlx.message({ type:'error', text: window.i18n('邮件格式不正确，请重新填写')})
            return false
        }

        var $button = $(this)
        $button.text(i18n('提交中...')).data('disabled', true)
        $.betterPost('/api/1/user/invite', {
            'email': email
        }).done(function (val) {
            $('#emailSharePopup').hide()
            $('#emailSharePopup input[name=email]').val('')
            window.dhtmlx.message({text: i18n('发送成功'), expire: 3000})
        }).fail(function (ret) {
            if (ret === 40325) {
                window.dhtmlx.message({ type:'error', text: window.i18n('该邮箱已经注册')})
            }
            else {
                window.dhtmlx.message({ type:'error', text: window.getErrorMessageFromErrorCode(ret)})   
            }
        }).always(function () {
            $button.text(i18n('发送')).data('disabled', false)
        })
    })

    $('#emailSharePopup input[name=email]').keyup(function (e) {
        if(e.keyCode === 13) {
            $('#emailSharePopup .send').trigger('click')
        }
    })
})


