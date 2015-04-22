(function($, Swiper){
    var mySwiper,
        photoSwiper,
        photoThumbsSwiper
    mySwiper = new Swiper('.mainSwiper', {
        direction: 'vertical',
        effect: 'slide',
        containerScroll: 'true',
        coverflow: {
            rotate: 50,
            stretch: 0,
            depth: 100,
            modifier: 1,
            touchRatio: 0.4,
            slideShadows : true
        },
        /*cube: {
         slideShadows: true,
         shadow: true,
         shadowOffset: 20,
         shadowScale: 0.94
         },*/
        onInit: function (swiper, direction) {
            //var index = swiper.activeIndex
            //var height = $(window).innerHeight()
            //var obj = $('.swiper-slide')
            //obj.not('.swiper-slide-visible').find('.animate').addClass('hide')
//                    obj.eq(index).find('.animate').removeClass('hide')
        },
        onTransitionEnd: function (swiper, direction) {
            //console.log(new Date + ': onSlideChangeEnd!')
            var index = swiper.activeIndex
            var obj = $('.mainSwiper>.swiper-wrapper>.swiper-slide')
            //companyHeightReset()
            obj.eq(index).siblings().find('.animate').addClass('hide')
            obj.eq(index).find('.animate').removeClass('hide')
        }
    });
    photoSwiper = new Swiper('.pagePhoto', {
        slidesPerView: 1,
        spaceBetween: 10,
        //nested: true,
    })
    photoThumbsSwiper = new Swiper('.photoThumbs', {
        effect: 'slide',
        slidesPerView: 3,
        spaceBetween: 10,
        centeredSlides: true,
        touchRatio: 0.3,
        slideToClickedSlide: true,
        //nested: true,
        //slidesPerGroup: 1,
        //resistanceRatio: 0,
        //nextButton: 'nextButton',
        //prevButton: 'prevButton',
        onInit: function(){
            $('.animate').addClass('hide')
        }
    });
    $('.photoThumbs').siblings('.arrowButton').on('click', function(){
        var action = $(this).data('action')
        photoThumbsSwiper['slide' + action]()
    })
    photoSwiper.params.control = photoThumbsSwiper;
    photoThumbsSwiper.params.control = photoSwiper;
    $(window).load(function(){
        //所有资源加载完毕后：
        function loadCallback(){

            $('.loadingCover').css({
                height: $(window).height()
            })


            $('.loadingCover').fadeOut(200, function(){
                $('body').removeClass('loading')
                $('.swiper-slide').eq(0).find('.animate').removeClass('hide')
            })
        }
        setTimeout(function(){
            window.process.finish(loadCallback)
        },0)
    })
//点击按钮弹出对应的modal层,按钮上加上 .btnModal
    function initModal(){
        $('.btnModal').on('click', function(){
            var triggerId = $(this).attr('id')
            var modal = $('[data-trigger=' + triggerId + ']')
            modal.find('.animate').removeClass('hide')
            modal.removeClass('hide')

        })
        $('.btnCloseModal').on('click', function(){
            var modal = $(this).parents('.modal')
            modal.addClass('animation')
            setTimeout(function(){
                modal.addClass('hide').removeClass('animation')
            },400)
        })
    }
    $(function(){
        initModal()
    })

})(jQuery, window.Swiper)