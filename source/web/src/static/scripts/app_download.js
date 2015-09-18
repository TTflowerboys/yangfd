/**
 * Created by levy on 15-5-13.
 */
(function(Swiper){
    //Display ask invitation when from sign in page
    var from = window.team.getQuery('from', location.href)
    if(from === 'signin'){
        $('.downloadWrap').hide()
        $('.emailWrap').show()
    }else{
        $('.downloadWrap').show()
        $('.emailWrap').hide()
    }

    window.swiper = new Swiper('.appDownloadSwiper', {
        pagination: '.swiper-pagination',
        paginationClickable: true,
        autoplay: 4000
    });
    $('#subscribeBtn').bind('click', function (e) {
        var email = $('[name=email]').val()
        if(!/.+@.+\..+/.test(email)) {
            window.alert(i18n('邮件格式不正确，请重新填写'))
            return false
        }
        if($(this).data('disabled') === true) {
            return false
        }
        $('.subscribeAndroid').find('button').text(i18n('提交中...')).data('disabled', true)
        $.betterPost('/api/1/subscription/add', {
            'tag': JSON.stringify(['subscribe_android_app']),
            'email': email
        }).done(function (val) {
            $('.subscribeAndroid').hide().siblings('.info').show()
        }).fail(function (ret) {
            window.alert(window.getErrorMessageFromErrorCode(ret))
        }).always(function () {
            $('.subscribeAndroid').find('button').text(i18n('订阅')).data('disabled', false)
        })
    })
    $('[name=email]').keyup(function (e) {
        if(e.keyCode === 13) {
            $('#submitBtn').trigger('click')
        }
    })
    $('a.appStore').click(function (e) {
        if (window.team.isWeChat()) {
            e.preventDefault()
            window.wechatShareSDK.showGuideLine(i18n('点击后在弹出的菜单中选择 [在Safari中打开]'))
        }
    })


    window.team.initDisplayOfElement()
    var wechatShareData = {
        title: window.i18n('发现一个很不错的海外出租，求租的东东，小伙伴们不用谢！大家好才是真的好！'),
        link: window.location.href,
        imgUrl: 'http://upload.yangfd.com/app_icon_x120_150427.png',
        desc: window.i18n('发现一个很不错的海外出租，求租的东东，小伙伴们不用谢！大家好才是真的好！'),
        success:function(){
            ga('send', 'event', 'app_download', 'share', 'share-to-wechat-success')
        },
        cancel:function(){
            ga('send', 'event', 'app_download', 'share', 'share-to-wechat-cancel')
        }
    }
    if(window.team.getQuery('target', location.href) === 'user-coupons') {
        var venueId = window.team.getQuery('venue', location.href)
        var dealId = window.team.getQuery('deal', location.href)
        wechatShareData = _.extend(wechatShareData, {
            success:function(){
                ga('send', 'event', 'offer', 'share', 'share-to-wechat-success')
            },
            cancel:function(){
                ga('send', 'event', 'offer', 'share', 'share-to-wechat-cancel')
            }
        })
        if(venueId && dealId) {
            $.betterPost('/api/1/venue/' + venueId)
                .done(function (venue) {
                    var deal = _.find(venue.deals, function (item) {
                        return item.id === dealId
                    })
                    wechatShareData = _.extend(wechatShareData, {
                        title: deal.share_text_v2 ? deal.share_text_v2 : deal.share_text,
                        link: window.location.href,
                        imgUrl: venue.logo,
                        desc: venue.name + '-' + deal.name
                    })
                    window.wechatShareSDK.init(wechatShareData)
                })
        } else {
            window.wechatShareSDK.init(wechatShareData)
        }
    } else {
        window.wechatShareSDK.init(wechatShareData)
    }
})(window.Swiper)