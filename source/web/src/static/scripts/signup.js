$(function () {

    //Pre-enter invation code if url contains
    var invitationCode = window.team.getQuery('invitation_code', location.href)
    if(invitationCode !== ''){
        $('form[name=register]').find('input[name=invitation_code]').val(invitationCode)
    }

    var referral = window.team.getQuery('referral', location.href)
    if(referral !== ''){
        $('form[name=register]').find('input[name=referral]').val(referral)
        var discount = window.team.getQuery('discount', location.href)
        if (!discount) {
            discount = ''
        }
        
        /*
         * Weixin share sdk
         * */
        var wechatShareData = {
            title: window.i18n('洋房东 ' + discount + '租房优惠'),
            link: window.location.href,
            imgUrl: 'http://upload.yangfd.com/app_icon_x120_150427.png',
            desc: window.i18n('还在为租房苦恼吗？ 使用我的邀请码在洋房东注册，寻找合适房源，立享优惠！'),
            success:function(){
                ga('send', 'event', 'signup', 'share', 'share-to-wechat-success')
            },
            cancel:function(){
                ga('send', 'event', 'signup', 'share', 'share-to-wechat-cancel')
            }
        }
        window.wechatShareSDK.init(wechatShareData)
    }

    window.project.showRecaptcha('captcha_div')

    window.refreshCaptcha = function () {
        window.project.showRecaptcha('captcha_div')
    }

    var errorArea = $('form[name=register]').find('.errorMessage')

    var onPhoneNumberChange = function () {
        var params = $('form').serializeObject()
        var theParams = {}
        theParams.phone = '+' + params.country_code + params.phone
        var $input = $('form input[name=phone]')
        $input.css('border', '')
        errorArea.hide()
        if (theParams.phone) {
            $.betterPost('/api/1/user/phone_test', theParams)
                .done(function () {
                    $input.css('border', '')
                    errorArea.hide()

                })
                .fail(function () {
                    window.dhtmlx.message({type:'error', text: window.getErrorMessage('phone', 'number')})
                    errorArea.text(window.getErrorMessage('phone', 'number'))
                    errorArea.show()
                    $input.css('border', '2px solid red')
                })
        }
        else {
            $input.css('border', '')
            errorArea.hide()
        }
    }
    $('form select[name=country_code]').on('change', onPhoneNumberChange)
    $('form input[name=phone]').on('change', onPhoneNumberChange)
        
    function setupAffiliateUserType(callback) {        
        var apiUrl = '/api/1/user/edit'
        var userTypeData = window.userTypeMap['affiliate']
        $.betterPost(apiUrl, {user_type: userTypeData})
            .done(function (data) {
                window.user = data
                callback(data)
            })
            .fail(function (data) {
                callback(data)
            })
    }
    
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

        if(_.isEmpty(params.referral) || params.referral === ''){
            delete params.referral
        }
        params.password = Base64.encode(params.password)
        $.betterPost('/api/1/user/register', params)
            .done(function (result) {
                ga('send', 'event', 'signup', 'result', 'signup-success')
                
                var from = team.getQuery('from', location.href)                              
                if (location.pathname === '/affiliate-signup') {
                    setupAffiliateUserType(function() {
                        if (from) {
                            location.href = '/verify-phone?from=' + from                            
                        }
                        else {
                            location.href = '/verify-phone'
                        }
                    })
                }
                else {                    
                    var targetUrl = '/verify-phone?from=' + encodeURIComponent('/intention' + (from ? '?from=' + from : ''))
                    location.href = targetUrl    
                }            
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
