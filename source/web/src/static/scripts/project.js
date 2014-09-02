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
        goBackFromURL: function () {
            window.location.href = team.getQuery('from');
            return false //prevent default action for <a>
        }
    }
})();
