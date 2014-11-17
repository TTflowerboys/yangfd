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
            location.href = '/reset_password?from=' + encodeURIComponent(from ? from : location.href)
            return false //prevent default action for <a>
        },
        goToIntention: function () {
            var from = team.getQuery('from', location.href)
            location.href = '/intention?from=' + encodeURIComponent(from ? from : location.href)
            return false //prevent default action for <a>
        },
        goBackFromURL: function () {
            window.location.href = team.getQuery('from');
            return false //prevent default action for <a>
        },
        showSignInModal: function () {
            $('#modal_shadow').show()
            $('#modal').show()
            return false
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
        repaintHowItWorks: function () {

        },
        formatTime: function(time) {
            return $.format.date(time * 1000, 'yyyy-MM-dd HH:mm:ss')
        }
    }
})();
