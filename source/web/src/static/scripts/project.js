/* Created by frank on 14-8-4. */

(function () {

    window.project = {
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
        showSignInModal: function () {
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
    }
})();
