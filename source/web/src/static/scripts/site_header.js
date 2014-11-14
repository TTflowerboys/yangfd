
(function () {

    if (window.user) {
        $.betterPost('/api/1/message', {'status': 'new'})
            .done(function (data) {
                if (data.length > 0) {
                    document.getElementById('icon-message').style.display = 'none'
                    document.getElementById('icon-message-notif').style.display = 'inline'
                }
            })
            .fail(function (ret) {
            })
            .always(function () {

            })

    }

})()
