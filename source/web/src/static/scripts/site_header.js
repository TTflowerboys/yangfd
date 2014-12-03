
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


        //GA
        $('.message').on('click', function() {
            ga('send', 'event', 'header', 'click', 'setting-entry');
        });

        $('.nickname').on('click', function() {
            ga('send', 'event', 'header', 'click', 'message-entry');
        });

        $('.logout').on('click', function() {
            ga('send', 'event', 'header', 'click', 'logout');
        });
    }

})()
