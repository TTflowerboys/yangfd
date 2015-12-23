window.setupDownload = function (Swiper) {
    //Display ask invitation when from sign in page

    $('.downloadWrap').show()
    $('.emailWrap').hide()
    $('.downloadWrap .appStore').show()
    $('.downloadWrap .googlePlay').show()
    $('.downloadWrap .web').hide()
    $('.downloadWrap .subscribeAndroid').hide()

    window.indexAppDownloadSwiper = new Swiper('.appDownloadSwiper', {
        pagination: '.swiper-pagination',
        paginationClickable: true,
        autoplay: 4000
    });

    $('a.appStore').click(function (e) {
        ga('send', 'event', 'index', 'click', 'app-download')
        if (window.team.isWeChat()) {
            e.preventDefault()
            window.wechatShareSDK.showGuideLine(i18n('点击后在弹出的菜单中选择 [在Safari中打开]'))
        }
    })

    $('[name=email]').keyup(function (e) {
        if(e.keyCode === 13) {
            $('#submitBtn').trigger('click')
        }
    })
}

$('#subscribeBtn').bind('click', function (e) {
    var email = $('[name=email]').val()
    if(!window.project.emailReg.test(email)) {
        window.dhtmlx.message({ type:'error', text: window.i18n('邮件格式不正确，请重新填写')})
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
        window.dhtmlx.message({ type:'error', text: window.getErrorMessageFromErrorCode(ret)})
    }).always(function () {
        $('.subscribeAndroid').find('button').text(i18n('订阅')).data('disabled', false)
    })
})
$('.landlordService .tabWrapper').tabs({trigger: 'click', autoSelectFirst: false, className: 'active'}).switch('landlord')