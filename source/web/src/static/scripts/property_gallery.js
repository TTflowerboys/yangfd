(function () {
    function updateResponsiveSlides($slide, auto) {
        $slide.responsiveSlides({
            pager: true,
            auto: auto,
            nav: true,
            pause: true,
            prevText: '<',
            nextText: '>'
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


    $('[data-tabs]').tabs({trigger: 'click'}).on('openTab', function (event, target, tabName) {
        if (tabName === 'video') {
            //Hide labels to show no-video-js text and for better video experience
            $('.content .pictures .labels').hide()
        }else{
            $('.content .pictures .labels').show()
        }

        ga('send', 'event', 'property_detail', 'click', 'change-tab',tabName)
    })
})()
