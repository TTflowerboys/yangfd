/* Created by frank on 14-8-4. */

(function () {

    window.project = {
        cache: {},
        goToSignIn: function () {
            var from = team.getQuery('from', location.href)
            location.href = '/signin?from=' + encodeURIComponent(from ? from : location.href)
            return false //prevent default action for <a>
        },
        goToSignUp: function () {
            var from = team.getQuery('from', location.href)
            location.href = '/signup?from=' + encodeURIComponent(from ? from : location.href)
            return false //prevent default action for <a>
        },
        goToResetPassword: function () {
            var from = team.getQuery('from', location.href)
            location.href = '/reset-password?from=' + encodeURIComponent(from ? from : location.href)
            return false //prevent default action for <a>
        },
        goToResetPasswordByPhone: function () {
            var from = team.getQuery('from', location.href)
            location.href = '/reset-password-phone?from=' + encodeURIComponent(from ? from : location.href)
            return false //prevent default action for <a>
        },
        goToResetPasswordByEmail: function () {
            var from = team.getQuery('from', location.href)
            location.href = '/reset-password-email-1?from=' + encodeURIComponent(from ? from : location.href)
            return false //prevent default action for <a>
        },
        goToVerifyPhone: function () {
            var from = team.getQuery('from', location.href)
            location.href = '/verify-phone?from=' + encodeURIComponent(from ? from : location.href)
            return false //prevent default action for <a>
        },
        goToIntention: function () {
            var from = team.getQuery('from', location.href)
            location.href = '/intention?from=' + encodeURIComponent(from ? from : location.href)
            return false //prevent default action for <a>
        },
        goToVerifyPhoneThenIntention: function () {
            var from = team.getQuery('from', location.href)
            location.href = '/verify-phone?from=' + encodeURIComponent('/intention' + (from ? '?from=' + from : ''))
            return false
        },
        goBackFromURL: function () {
            if (team.getQuery('from') !== '') {
                window.location.href = team.getQuery('from');
            } else {
                // Return to home page if no from provide
                window.location.href = window.location.origin;
            }
            return false //prevent default action for <a>
        },
        replaceToFromURL: function () {
            if (team.getQuery('from') !== '') {
                window.location.replace(team.getQuery('from'));
            } else {
                // Return to home page if no from provide
                window.location.href = window.location.origin;
            }
            return false //prevent default action for <a>
        },
        showSignInModal: function (options) {
            if(options && options.country_code) {
                $('#modal').find('[name=country_code]').val(options.country_code)
            }
            if(options && options.phone) {
                $('#modal').find('[name=phone]').val(options.phone)
            }
            $('#modal_shadow').show()
            $('#modal').show()
            return false
        },
        showSignInModalOrGoToSignIn: function () {
            if (team.isPhone()) {
                window.project.goToSignIn()
            }
            else {
                window.project.showSignInModal()
            }
            return false
        },
        logout: function () {
            var logoutUrl = '/logout?return_url=%2Fsignin';
            if (window.bridge !== undefined) {
                window.bridge.callHandler('logout', logoutUrl);
            }
            else {
                window.location = logoutUrl
            }
        },
        goToUserSettings: function () {
            if (team.isPhone()) {
                window.location.href = '/user';
            } else {
                window.location.href = '/user_settings';
            }
            return false //prevent default action for <a>
        },
        checkLoginIfNot: function () {
            if (!window.user) {
                if (team.isPhone()) {
                    window.project.goToSignIn()
                }
                else {
                    window.project.showSignInModal()
                }
                return true
            }
            else {
                return false
            }
        },
        updateMenuTitle: function (text) {
            //Replace all underscore to space for issue 5973
            $('.siteHeader_phone .rmm-toggled .rmm-toggled-controls .rmm-center').text(text.replace(/_/g, ' '))
        },
        repaintHowItWorks: function () {

        },
        openRequirement: function (event, budgetId, intentionId, propertyId) {
            if (team.isPhone()) {
                if (!budgetId) { budgetId = ''}
                if (!intentionId) {intentionId = ''}
                if (!propertyId) {propertyId = ''}

                location.href = '/requirement?budget=' + budgetId + '&intention=' + intentionId + '&property=' + propertyId
            }
            else {
                window.openRequirementForm(event, budgetId, intentionId, propertyId)
            }
        },
        formatTime: function (time, format) {
            format = format || 'yyyy-MM-dd HH:mm:ss'
            return $.format.date(time * 1000, format)
        },
        formatDate: function (time) {
            return $.format.date(time * 1000, 'yyyy-MM-dd')
        },
        isMobileClient: function () {
            var ua = navigator.userAgent.toLowerCase()
            return (/currant/.test(ua)) ? true : false
        },
        emailReg : /^[-a-z0-9~!$%^&*_=+}{\'?]+(\.[-a-z0-9~!$%^&*_=+}{\'?]+)*@([a-z0-9_][-a-z0-9_]*(\.[-a-z0-9_]+)*\.(aero|arpa|biz|com|coop|edu|gov|info|int|mil|museum|name|net|org|pro|travel|mobi|[a-z][a-z])|([0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}))(:[0-9]{1,5})?$/i,
        includePhoneOrEmail: function (text) {
            var includePhoneReg = /(?:(?:\+?1\s*(?:[.-]\s*)?)?(?:\(\s*([2-9]1[02-9]|[2-9][02-8]1|[2-9][02-8][02-9])\s*\)|([2-9]1[02-9]|[2-9][02-8]1|[2-9][02-8][02-9]))\s*(?:[.-]\s*)?)?([2-9]1[02-9]|[2-9][02-9]1|[2-9][02-9]{2})\s*(?:[.-]\s*)?([0-9]{4})(?:\s*(?:#|x\.?|ext\.?|extension)\s*(\d+))?/
            var includeEmailReg = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}/i
            return includePhoneReg.test(text) || includeEmailReg.test(text)
        },
        getEnum: function (type) {
            return window.Q.Promise(_.bind(function (resolve, reject, notify) {
                if(this.cache[type]) {
                    resolve(this.cache[type])
                } else {
                    $.get('/api/1/enum/search', {type: type, sort: true})
                        .then(function (data) {
                            window.project.cache[type] = data.val
                            resolve(data.val)
                        })
                }
            }, this))
        },
        showRecaptcha: function (containerId) {
            if($('#' + containerId).find('a img').length){
                $('#' + containerId).find('a img').hide()
            }
            $.betterPost('/api/1/captcha/generate', {})
                .done(function (data) {
                    if (data) {
                        var $data = $('<div></div>')
                        $data.append(data)
                        $('#' + containerId).empty()
                        $data.find('[name=solution]').attr('placeholder', window.i18n('验证码'))
                        $('#' + containerId).append($data.html())
                    }
                })
                .fail(function (ret) {
                })
                .always(function () {

                })
        }
    }
})();
