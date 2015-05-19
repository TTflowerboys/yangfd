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
    (function () {
        var timer
        $('.rslides .fancybox').fancybox({
            openEffect	: 'elastic',
            closeEffect	: 'elastic',
            type: 'image',
            groupAttr: 'rel',
            autoSize: false,
            helpers	: {
                overlay: {
                    locked: false
                },
                title	: {
                    type: 'outside'
                },
                thumbs	: {
                    width	: 50,
                    height	: 50
                }
            },
            beforeShow: function () {
                clearInterval(timer)
                timer = setInterval(function () { //周期性的触发mouseenter事件，以阻止slide（只能通过这样的方式）
                    $('a.rslides_nav.rslides1_nav.next').trigger('mouseenter')
                },500)
            },
            afterClose: function () {
                clearInterval(timer)
                $('a.rslides_nav.rslides1_nav.next').trigger('mouseleave')
            }
        })
    })()
    /*$('.rslides .img').bind('click', function(){
        //var url = $(this).data('url')
        var url = $(this).attr('data-url')
        $.fancybox({
            href: url,
            title : 'Custom Title',
            type: 'image'
        });
    })*/
})()
