(function () {
    window.team.initDisplayOfElement()
    function shareSuccessCallback () {
        $('[data-shared=false]').hide()
        $('[data-shared=true]').show()
    }
    $('.shareBtn').on('click', function () {
        if(window.bridge) {
            window.bridge.callHandler('share', {
                'text': $(this).attr('data-shareText'),
                'url': location.protocol + '//' + location.host + '/app-download?target=user-coupons&venue=' + $(this).attr('data-venueId') + '&deal=' + $(this).attr('data-dealId'),
                'image': $(this).attr('data-shareImage'),
                'services': ['Wechat Circle']
            }, function(response) {
                if (response.msg === 'ok') {
                   return shareSuccessCallback()
                }
                //todo App中取消分享或者分享失败
            })
        } else {
            var wechatShareData = {
                title: $(this).attr('data-shareText'),
                link: location.protocol + '//' + location.host + '/app-download?target=user-coupons&venue=' + $(this).attr('data-venueId') + '&deal=' + $(this).attr('data-dealId'),
                imgUrl: $(this).attr('data-shareImage'),
                desc: $(this).attr('data-shareDesc'),
                success:function(){
                    return shareSuccessCallback()
                },
                cancel:function(){

                }
            }
            window.wechatShareSDK.setUp(wechatShareData)
        }
    })
})()