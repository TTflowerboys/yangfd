(function () {
    var bannerSlide
    function initBannerSlide() {
        if(window.team.isPhone() && !bannerSlide) {
            bannerSlide = new window.Swiper('.swiper-container', {
                autoplay: 3000,
                pagination: '.swiper-pagination',
                paginationClickable: true
            })
        }
    }
    initBannerSlide()
    $(window).resize(initBannerSlide)

    function initOrgan() {
        $('section').eq(0).addClass('active')
        $('section h2').on('click', function () {
            var offset = $(this).parent('section').index() * $(window).width() * 0.21 + $('section').eq(0).offset().top
            if(!$(this).parent('section').hasClass('active')) {
                $('body,html').stop(true,true).animate({scrollTop: offset}, 400)
            }
            $(this).parent('section').toggleClass('active').siblings('section').removeClass('active')
        })
    }
    initOrgan()
})()