/* Created by frank on 14-8-4. */

(function () {
    window.team = window.team || {}
    window.team.utils = {
        wrapErrors: function (jQueryAjax) {
            jQueryAjax
                .done(function (response) {
                    if (response.ret !== 0) {
                        alert(response.ret)
                    }
                })
                .fail(function (xhr) {
                    alert(xhr.status)
                })

            return jQueryAjax
        }
    }
})();
