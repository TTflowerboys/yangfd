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

    if (typeof window.wx !== 'undefined') {
        window.wx.config({
            debug: false, // 开启调试模式,调用的所有api的返回值会在客户端alert出来，若要查看传入的参数，可以在pc端打开，参数信息会通过log打出，仅在pc端时才会打印。
            appId: 'wx123992a4d173037b', // 必填，公众号的唯一标识
            timestamp: 1427094050, // 必填，生成签名的时间戳
            nonceStr: 'j55lkbj63nxw29', // 必填，生成签名的随机串
            signature: 'ace568249973e33e24086e6df8a44f9bd1e2fa87',// 必填，签名，见附录1
            jsApiList: ['onMenuShareTimeline', 'onMenuShareAppMessage', 'onMenuShareQQ'] // 必填，需要使用的JS接口列表，所有JS接口列表见附录2
        });

        window.wx.ready(function(){
            var propertyTitle = property.name
            if (property.country && property.country.code) {
                propertyTitle += ' '
                propertyTitle += window.team.countryMap[property.country.code]
            }
            if (property.city && property.city.name) {
                propertyTitle += ' '
                propertyTitle += property.city.name
            }

            var propertyImage = null
            if (property.cover) {
                propertyImage = property.cover
            }
            else if (property.reality_images && property.reality_images.length) {
                propertyImage = property.reality_images[0]
            }
            var wechatShareData = {
                title:property.name,
                link:location.href,
                imgUrl:propertyImage,
            }
            window.wx.onMenuShareTimeline(wechatShareData);
            if (property.decription) {
                wechatShareData.desc = property.description.replace(/\n/g,' ')
            }
            window.wx.onMenuShareAppMessage(wechatShareData);
            window.wx.onMenuShareQQ(wechatShareData);
        });
    }
})()
