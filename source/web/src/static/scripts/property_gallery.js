(function () {
    function updateResponsiveSlides($slide, auto) {
        $slide.responsiveSlides({
            pager: true,
            auto: auto,
            nav: true,
            pause: true,
            prevText: '<',
            nextText: '>',
            pauseControls: true,
        })
    }

    updateResponsiveSlides($('.pictures .rslides'), true)

    $('.rslides_wrapper .leftPressArea').click(function (event) {
        $(event.target).parent().find('a.prev').click()

        ga('send', 'event', 'property_detail', 'click', 'prev-image',$(event.target).parent().parent().attr('data-tab-name'))
    })

    $('.rslides_wrapper .rightPressArea').click(function (event) {
        $(event.target).parent().find('a.next').click()

        ga('send', 'event', 'property_detail', 'click', 'next-image',$(event.target).parent().parent().attr('data-tab-name'))
    })

    window.loadVideoStarted = false
    function startLoadVideo() {
        window.loadVideoStarted = true
        var property = JSON.parse($('#pythonProperty').text())
        if (property.videos && property.videos[0] && property.videos[0].sources) {
            $.betterPost('/api/1/misc/get_video_source', {property_id:property.id})
                .done(function (data) {
                    if (data && data.length) {
                        var videoResult = _.template($('#propertyVideo_template').html())({sources: data})
                        $('[data-tab-name=video]').append(videoResult)
                        $('[data-tab-name=video]').append('<script>videojs.options.flash.swf = "/static/bower_components/video-js/dist/video-js/video-js.swf";</script>')
                        $('#videoLoadIndicator').hide()
                    }
                })
                .fail(function (ret) {
                })
        }
    }



//     function resumeVideo() {
//         if (typeof videojs !== 'undefined') {
//             var propertyPlayer = window.videojs('property_video')
//             if (propertyPlayer) {
//                 if (propertyPlayer.paused()) {
//                     propertyPlayer.play()
//                 }
//             }
//         }
//     }

    function pauseVideo() {
        if (typeof videojs !== 'undefined') {
            var propertyPlayer = window.videojs('property_video')
            if (propertyPlayer) {
                propertyPlayer.pause()
            }
        }
    }

    $('.pictures').tabs({trigger: 'click'}).on('openTab', function (event, target, tabName) {
        if (tabName === 'video') {
            //Hide labels to show no-video-js text and for better video experience
            $('.content .pictures .labels').hide()

            if (!window.loadVideoStarted) {
                startLoadVideo()
            }
//             resumeVideo()
        }else{
            pauseVideo()
            var $tabContent = $('.pictures [data-tab-name=' + tabName + ']')
            var $slides = $tabContent.find('.rslides')
            window.initSlidesImages($slides)
            $('.content .pictures .labels').show()
        }

        ga('send', 'event', 'property_detail', 'click', 'change-tab',tabName)
    });

    //点击相册查看大图的功能
    $('.rslides').each(function (index, elem) {
        function initPhotoSwipe() {
            $(elem).find('li').css('cursor', 'zoom-in')
            $(elem).attr('data-pswp-uid', index)
                .delegate('li', 'click', function(e){
                    var $gallery = $(this).parent('.rslides')
                    openPhotoSwipe($(this).index(), $gallery)
                })

            function parseThumbnailElements (elem) {
                return _.map($.makeArray(elem.find('li')), function(el, i) {
                    var src = $(el).attr('href')
                    var item = {
                        src: src,
                        el: el,
                        w: $(el).attr('data-width'),
                        h: $(el).attr('data-height')
                    }
                    return item
                })
            }
            function openPhotoSwipe (index, galleryElement) {
                var pswpElement = $('.pswp')[0],
                    gallery,
                    options,
                    items = parseThumbnailElements(galleryElement)
                options = {
                    index: index,
                    galleryUID: galleryElement.attr('data-pswp-uid'),
                }
                gallery = new window.PhotoSwipe(pswpElement, window.PhotoSwipeUI_Default, items, options)
                gallery.init();
            }
        }
        var total = $(elem).find('li[href]').length, //需要加载图片总数
            current,
            timer
        function checkImageLoaded(src) {
            var img = new Image();
            img.src = src;
            if(img.complete) {
                var size = {
                    w: img.width,
                    h: img.height
                }
                img = null;
                return size
            }
            img = null;
            return false
        }
        function checkAllNeedImageLoaded (){
            current = 0
            $(elem).find('li[href]').each(function (index, elem) {
                if($(elem).attr('data-width')) {
                    current++
                } else if(checkImageLoaded($(elem).attr('href'))) {
                    var size = checkImageLoaded($(elem).attr('href'))
                    $(elem).attr('data-width', size.w).attr('data-height', size.h)
                    current++
                } else {
                    return false
                }
            })
            return current === total
        }
        function initPhotoSwipeWhenReady() {
            if(checkAllNeedImageLoaded()) {
                clearTimeout(timer)
                initPhotoSwipe()
            } else {
                timer = setTimeout(function () {
                    initPhotoSwipeWhenReady()
                }, 500)
            }
        }

        initPhotoSwipeWhenReady()
    })
})()
