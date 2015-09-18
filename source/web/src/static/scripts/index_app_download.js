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
}
