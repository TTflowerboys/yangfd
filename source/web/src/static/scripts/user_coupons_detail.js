(function () {
    window.team.initDisplayOfElement()
    function shareSuccessCallback () {
        $('[data-shared=false]').hide()
        $('[data-shared=true]').show()
    }
    $('.shareBtn').on('click', function () {
        if(window.bridge) {
            ga('send', 'event', 'offer', 'click', 'share-to-wechat-in-app')
            window.bridge.callHandler('share', {
                'text': $(this).attr('data-sharetextv2') && window.team.isCurrantClient('>1.1.1') ? $(this).attr('data-sharetextv2') : $(this).attr('data-sharetext'),
                'url': location.protocol + '//' + location.host + '/app-download?target=user-coupons&venue=' + $(this).attr('data-venueId') + '&deal=' + $(this).attr('data-dealId'),
                'image': $(this).attr('data-shareimage'),
                'services': ['Wechat Circle']
            }, function(response) {
                if (response.msg === 'ok') {
                    ga('send', 'event', 'offer', 'share', 'share-to-wechat-success-in-app')
                    return shareSuccessCallback()
                } else {
                    ga('send', 'event', 'offer', 'share', 'share-to-wechat-cancel-in-app')
                }
                //todo App中取消分享或者分享失败
            })
        } else {
            ga('send', 'event', 'offer', 'click', 'share-to-wechat-in-wechat')
            var wechatShareData = {
                title: $(this).attr('data-sharetextv2') ? $(this).attr('data-sharetextv2') : $(this).attr('data-sharetext'),
                link: location.protocol + '//' + location.host + '/app-download?target=user-coupons&venue=' + $(this).attr('data-venueid') + '&deal=' + $(this).attr('data-dealid'),
                imgUrl: $(this).attr('data-shareimage'),
                desc: $(this).attr('data-sharedesc'),
                success:function(){
                    ga('send', 'event', 'offer', 'share', 'share-to-wechat-success-in-wechat')
                    return shareSuccessCallback()
                },
                cancel:function(){
                    ga('send', 'event', 'offer', 'share', 'share-to-wechat-cancel-in-wechat')
                }
            }
            window.wechatShareSDK.setUp(wechatShareData)
        }
    })
})()