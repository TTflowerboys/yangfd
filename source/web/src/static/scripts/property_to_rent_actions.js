(function () {

    $('[data-fn=addFav]').on('click', function () {
        ga('send', 'event', 'rent_detail', 'click', 'add-fav')
        if (window.project.checkLoginIfNot()) {
            return
        }
        var $button = $(this)
        var rent_id = $button.attr('data-rent-id')
        ga('send', 'pageview', '/property-to-rent/'+ rent_id +'/add-fav')

        $.betterPost('/api/1/user/favorite/add', {
            ticket_id: rent_id,
            type: 'rent_ticket'
        })
            .done(function (val) {
                $button.hide().parent().find('[data-fn=removeFav]').show()

                ga('send', 'event', 'property_to_rent_detail', 'click', 'add-fav-success')
                ga('send', 'pageview', '/property-to-rent/'+ rent_id +'/add-fav-success')
            })
            .fail(function (errorCode) {
                if (errorCode !== 40100) {
                    window.alert($button.attr('data-message-' + errorCode) || i18n('服务器忙，请稍后重试。'))
                }

                ga('send', 'event', 'property_to_rent_detail', 'click', 'add-fav-failed',errorCode)
            })


    })

    $('[data-fn=removeFav]').on('click', function () {
        ga('send', 'event', 'property_to_rent_detail', 'click', 'remove-fav')
        if (window.project.checkLoginIfNot()) {
            return
        }
        var $button = $(this)
        var rent_id = $button.attr('data-favorite-id')
        $.betterPost('/api/1/user/favorite/remove', {
            ticket_id: rent_id,
            type: 'rent_ticket'
        })
            .done(function () {
                $button.hide().parent().find('[data-fn=addFav]').show()
                ga('send', 'event', 'property_to_rent_detail', 'click', 'remove-fav-success')
            })
            .fail(function (errorCode) {
                if (errorCode !== 40100) {
                    window.alert($button.attr('data-message-' + errorCode) || i18n('服务器忙，请稍后重试。'))
                }
                ga('send', 'event', 'property_to_rent_detail', 'click', 'remove-fav-failed',errorCode)
            })
    })

    $('[data-fn=shareToWeChat]').on('click', function () {
        $('#popupShareToWeChat')
            .find('img').prop('src', '/qrcode/generate?content=' + encodeURIComponent(location.origin + '/wechat-poster/' + $(this).attr('data-id'))).end()
            .modal()
        ga('send', 'event', 'property_to_rent_detail', 'share', 'open-wechat-web')
    })

})()
