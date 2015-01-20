(function () {
    var property = JSON.parse($('#pythonProperty').text())
    $('.rmm-toggled .rmm-toggled-controls .rmm-toggled-share').on('click', function () {
        window.openWeChatShare(property.id)
        ga('send', 'event', 'property_detail', 'share', 'open-wechat-mobile')
    });

    window.openWeChatShare = function (propertyId) {
        if (window.team.isWeChat()) {
            if (window.team.isWeChatiOS()) {
                $('.wechatPage_popup .buttonHolder').attr('src', '/static/images/property_details/wechat_share/phone/wechat_button_ios.png')
            }
            $('.wechatPage_popup').modal()
            $('.wechatPage_popup').find('.close-modal').hide()
        }
        else {
            location.href = '/wechat_share?property=' + propertyId
        }
    }
})()
