(function () {


    $('[data-fn=addFav]').on('click', function () {
        ga('send', 'event', 'property_detail', 'click', 'add-fav')
        if (window.project.checkLoginIfNot()) {
            return
        }
        var $button = $(this)
        var property_id = $button.attr('data-property-id')
        ga('send', 'pageview', '/property/'+ property_id +'/add-fav')

        $.betterPost('/api/1/user/favorite/add', {
            property_id: property_id,
            type: 'property'
        })
            .done(function (val) {
                $button.hide().parent().find('[data-fn=removeFav]').show().attr('data-favorite-id', val)

                ga('send', 'event', 'property_detail', 'click', 'add-fav-success')
                ga('send', 'pageview', '/property/'+ property_id +'/add-fav-success')
            })
            .fail(function (errorCode) {
                if (errorCode !== 40100) {
                    window.alert($button.attr('data-message-' + errorCode) || i18n('服务器忙，请稍后重试。'))
                }

                ga('send', 'event', 'property_detail', 'click', 'add-fav-failed',errorCode)
            })


    })

    $('[data-fn=removeFav]').on('click', function () {
        ga('send', 'event', 'property_detail', 'click', 'remove-fav')
        if (window.project.checkLoginIfNot()) {
            return
        }
        var $button = $(this)
        var favorite_id = $button.attr('data-favorite-id')
        $.betterPost('/api/1/user/favorite/' + favorite_id + '/remove')
            .done(function () {
                $button.hide().parent().find('[data-fn=addFav]').show()
                ga('send', 'event', 'property_detail', 'click', 'remove-fav-success')
            })
            .fail(function (errorCode) {
                if (errorCode !== 40100) {
                    window.alert($button.attr('data-message-' + errorCode) || i18n('服务器忙，请稍后重试。'))
                }
                ga('send', 'event', 'property_detail', 'click', 'remove-fav-failed',errorCode)
            })
    })

    $('[data-fn=shareToWeChat]').on('click', function () {
        $('#popupShareToWeChat')
            .find('img').prop('src', '/qrcode/generate?content=' + encodeURIComponent(location.href)).end()
            .modal()
        ga('send', 'event', 'property_detail', 'share', 'open-wechat-web')
    })

})()
