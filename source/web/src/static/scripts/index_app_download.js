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
        if (window.team.isWeChat()) {
            e.preventDefault()
            showGuideLine()
        }
    })
    function showGuideLine () {
        $('.guideLine').fadeIn(300).click(function () {
            $(this).fadeOut(300)
        })
    }
}
