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
            if($('.pagePhoto').length > 0){
                createPhotoListSwiper()
            }else{
                allInitHanddler()
            }
        },
        onTransitionEnd: function (swiper, direction) {
            //console.log(new Date + ': onSlideChangeEnd!')
            var index = swiper.activeIndex
            var obj = $('.mainSwiper>.swiper-wrapper>.swiper-slide')
            //companyHeightReset()
            obj.eq(index).siblings().find('.animate').addClass('hide').removeClass('animation')
            obj.eq(index).find('.animate').removeClass('hide').addClass('animation')
            if(index < 6 && parent && parent.previewMoveTo){ //如果在发布预览页的iframe中展示，那么调用父窗口的方法改变父窗口对应的说明文字状态
                parent.previewMoveTo(index)
            }
        }
    });
    window.wechatSwiperMoveTo = function(num, speed, callback) {
        if(typeof num !== 'number' || num < 0 || num >5){
            throw('Num must be an interger between 0 and 5!')
        }
        speed = speed || 500
        mySwiper.slideTo(num, speed, callback)
    }
    function createPhotoListSwiper(){
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
                allInitHanddler()
            }
        });
        $('.photoThumbs').siblings('.arrowButton').on('click', function(){
            var action = $(this).data('action')
            photoThumbsSwiper['slide' + action]()
        })
        photoSwiper.params.control = photoThumbsSwiper;
        photoThumbsSwiper.params.control = photoSwiper;
    }
    function allInitHanddler(){
        var obj = $('.swiper-slide')
        obj.not('.swiper-slide-visible').find('.animate').addClass('hide')
    }
    $(window).on('ownLoadEvent', function() {
        //所有资源加载完毕后：
        if(!window.isInit){
            window.process.finish(loadCallback)
        }
        window.isInit = true
        function loadCallback(){
            if(parent && typeof parent.previewLoaded === 'function') {
                parent.previewLoaded()
            }
            $('.loadingCover').css({
                height: $(window).height()
            })
            $('.loadingCover').fadeOut(200, function(){
                $('body').removeClass('loading')
                $('.swiper-slide').eq(0).find('.animate').removeClass('hide').addClass('animation')
            })
        }
    })
    $(window).load(function(){
        $(window).trigger('ownLoadEvent')
    })

    //点击按钮弹出对应的modal层,按钮上加上 .btnModal
    function initModal(){
        $('.btnModal').on('click', function(){
            var triggerId = $(this).attr('id')
            var modal = $('[data-trigger=' + triggerId + ']')
            modal.find('.animate').removeClass('hide').addClass('animation')
            modal.removeClass('hide').addClass('animation')

        })
        $('.btnCloseModal').on('click', function(){
            var modal = $(this).parents('.modal')
            modal.addClass('hideAnimation')
            setTimeout(function(){
                modal.addClass('hide').removeClass('hideAnimation','animation')
            },400)
        })
    }
    //根据设施的条数来觉定是否显示'更多设施'按钮
    function showBtnOrNot(){
        var $btn = $('.morefacilitiesBtn')
        if($btn.prev('.facilities').find('li').length <= 6){
            $btn.hide()
        }
    }
    function isInPreviewIframe() {
        return parent.location.href.indexOf('property-to-rent') > 0
    }
    isInIframe()
    //根据是否为在微信中打开页面决定某些页面显示与否
    function hidePage(){
        if(window.team.isWeChat()){
            $('.hideInWechat').each(function(){
                mySwiper.removeSlide($(this).index())
            })
        }else{
            $('.hideOutsideWechat').each(function(){
                mySwiper.removeSlide($(this).index())
            })
        }
    }
    //详情与设施页只显示6项设施
    function showSixFacilitiesOnly(){
        $('.pageDescription').find('.facilities li').each(function(){
            if($(this).index() >= 6){
                $(this).remove()
            }
        })
    }

    $(function(){
        initModal()
        showBtnOrNot()
        hidePage()
        showSixFacilitiesOnly()
    })

})(jQuery, window.Swiper)