(function(){
    /*
     * Weixin share sdk
     * */
    var discount = window.team.getQuery('discount', location.href)
    if (!discount) {
        discount = ''
    }

    var wechatShareData = {
        title: window.i18n('洋房东 ' + discount + '租房优惠'),
        link: window.location.href,
        imgUrl: 'http://upload.yangfd.com/app_icon_x120_150427.png',
        desc: window.i18n('还在为租房苦恼吗？ 使用我的邀请码在洋房东注册，寻找合适房源，立享优惠！'),
        success:function(){
            ga('send', 'event', 'wechat_invite', 'share', 'share-to-wechat-success')
        },
        cancel:function(){
            ga('send', 'event', 'wechat_invite', 'share', 'share-to-wechat-cancel')
        }
    }
    window.wechatShareSDK.init(wechatShareData)
})()
