var mySwiper = new Swiper('.swiper-container', {
    direction: 'vertical',
    effect: 'slide',
    containerScroll: 'true',
    coverflow: {
        rotate: 50,
        stretch: 0,
        depth: 100,
        modifier: 1,
        slideShadows : true
    },
    /*cube: {
     slideShadows: true,
     shadow: true,
     shadowOffset: 20,
     shadowScale: 0.94
     },*/
    onInit: function (swiper, direction) {
        var index = swiper.activeIndex
        var height = $(window).innerHeight()
        var obj = $(".swiper-slide")
        obj.not(".swiper-slide-visible").find(".animate").addClass('hide')
//                    obj.eq(index).find(".animate").removeClass("hide")
    },
    onTransitionEnd: function (swiper, direction) {
        console.log(new Date + ': onSlideChangeEnd!')
        var index = swiper.activeIndex
        var obj = $(".swiper-slide")
        //companyHeightReset()
        obj.eq(index).siblings().find(".animate").addClass('hide')
        obj.eq(index).find(".animate").removeClass("hide")
    }
});
$('.loadingCover').css({
    height: $(window).height()
})
$(window).load(function(){
    //所有资源加载完毕后：
    function loadCallback(){
        $('.animate').addClass('hide')

        $('.loadingCover').fadeOut(200, function(){
            $('body').removeClass('loading')
            $(".swiper-slide").eq(0).find('.animate').removeClass('hide')
        })
    }
    setTimeout(function(){
        process.finish(loadCallback)
    },0)
})
//点击按钮弹出对应的modal层,按钮上加上 .btnModal
function initModal(){
    $('.btnModal').on('click', function(){
        var triggerId = $(this).attr('id')
        var modal = $('[data-trigger=' + triggerId + ']')
        modal.find('.animate').removeClass('hide')
        modal.removeClass('hide')
//                    mySwiper.lockSwipes() //阻止外层swiper的滚动

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
