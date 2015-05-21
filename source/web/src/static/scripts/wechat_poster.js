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
            if($('.pagePhoto').length > 0 && $('.pagePhoto .photoList').length > 0){
                createPhotoListSwiper()
            }else{
                allInitHanddler()
            }
        },
        onSlideChangeStart: function(swiper){

            // Record which pages user visits(only calculate first time visit)
            // TODO: deal with user swipe back to previous pages
            var index = parseInt(swiper.activeIndex)
            var prevIndex = parseInt(swiper.previousIndex)
            if(!isInPreview()&& index>0 && index>prevIndex && window.durationArray[index] === undefined){
                // calculate last page time consuming
                var preTotalTime = 0
                for(var i = 1; i <= index; i++){
                    preTotalTime += window.durationArray[i-1]
                }
                window.durationArray[index] = (new Date() - window.viewStartTime)/1000 - preTotalTime

                ga('send', 'event', 'wechat_poster', 'time-consuming', 'page'+index, window.durationArray[index])
                ga('send', 'pageview', '/wechat-poster/' + getCurrentRentId() + '/'+ (index+1))
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
        },
        onReachEnd: function (swiper){
            ga('send', 'event', 'wechat_poster', 'time-consuming', 'total-time', (new Date() - window.viewStartTime)/1000)
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

            // Get and send poster load time, aka from user open poster to user see first page
            window.durationArray[0] = (new Date() - window.viewStartTime)/1000
            ga('send', 'event', 'wechat_poster', 'time-consuming', 'load-time', window.durationArray[0])
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

            //Record when user view more
            if(triggerId === 'viewMoreBtn'){
                ga('send', 'event', 'wechat_poster', 'click', 'view-description')
            }else if(triggerId === 'morefacilitiesBtn'){
                ga('send', 'event', 'wechat_poster', 'click', 'view-facilities')
            }
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
    function isInPreview() { //表示在Web或者App发布预览页面中
        return parent.location.href.indexOf('property-to-rent') > 0 || window.project.isMobileClient()
    }
    //根据是否为在微信中打开页面决定某些页面显示与否
    function hidePage(){
        if(!isInPreview()){
            $('.hideInWechat.swiper-slide').each(function(){
                mySwiper.removeSlide($(this).index())
            })
            $('.hideInWechat').hide()
        }else{
            $('.hideOutsideWechat.swiper-slide').each(function(){
                mySwiper.removeSlide($(this).index())
            })
            $('.hideOutsideWechat').hide()
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
    // Get current rent ticket id
    function getCurrentRentId(){
        var urlpaths = window.location.pathname.split('/')
        if(urlpaths.length>0){
            return urlpaths[urlpaths.length-1]
        }else{
            return null
        }
    }
    // 横屏监听
    function UpdateOrientation(){
        this.notShow = false
        this.orientationChange = function () {
            if(window.orientation && (window.orientation.toString() === '-90' || window.orientation.toString() === '90') && this.notShow === false) {
                this.show()
            } else {
                this.close()
            }
        }
        this.init = this.orientationChange
        window.onorientationchange = this.orientationChange.bind(this)

        this.close = function () {
            $('.onorientationNotice').removeClass('animation').hide();
            //console.log('竖屏状态');
        }
        this.show = function () {
            $('.onorientationNotice').show().addClass('animation');
            //console.log('为了更好的体验，请将手机/平板竖过来！');
        }
        this.userClose = function () {
            this.close()
            this.notShow = true
        }
        $('.onorientationNotice').find('.closeBtn').bind('click', this.userClose.bind(this))
    }
    var updateOrientation = new UpdateOrientation()
    updateOrientation.init()
    $(function(){
        initModal()
        showBtnOrNot()
        hidePage()
        showSixFacilitiesOnly()
    })

})(jQuery, window.Swiper)