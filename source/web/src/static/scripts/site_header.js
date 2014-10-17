
(function () {

    if (window.user) {
        $.betterPost('/api/1/message', {'status': 'new'})
            .done(function (data) {
                if (data.length > 0) {
                    var icon = document.getElementById('icon-message')
                    var iconImagePath = icon.getAttribute('src')
                    var iconImageName = iconImagePath.substring(0, iconImagePath.lastIndexOf('.'))
                    var iconImageExtention = iconImagePath.substring(iconImagePath.lastIndexOf('.'))
                    var newIconImagePath = iconImageName  + '-notif' + iconImageExtention
                    icon.setAttribute('src', '')//reset
                    icon.setAttribute('src', newIconImagePath)
                    $(icon).css('margin-top', '1px')
                }
            })
            .fail(function (ret) {
            })
            .always(function () {

            })

    }

})()
