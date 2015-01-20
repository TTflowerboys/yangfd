(function () {
    $('.brochure .brochures').jcarousel()

    $('.brochures-control-prev')
        .on('jcarouselcontrol:active', function() {
            $(this).removeClass('inactive');
        })
        .on('jcarouselcontrol:inactive', function() {
            $(this).addClass('inactive');
        })
        .jcarouselControl({
            target: '-=1'
        });

    $('.brochures-control-next')
        .on('jcarouselcontrol:active', function() {
            $(this).removeClass('inactive');
        })
        .on('jcarouselcontrol:inactive', function() {
            $(this).addClass('inactive');
        })
        .jcarouselControl({
            target: '+=1'
        });

    $('.brochure .leftPressArea').click(function (event) {
        $(event.target).parent().find('.brochures-control-prev').click()
        ga('send', 'event', 'property_detail', 'prev', 'brochures-prev')
    })

    $('.brochure .rightPressArea').click(function (event) {
        $(event.target).parent().find('.brochures-control-next').click()
        ga('send', 'event', 'property_detail', 'next', 'brochures-next')
    })
})()
