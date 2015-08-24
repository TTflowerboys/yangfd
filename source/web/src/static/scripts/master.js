$(function () {
    window.project.updateMenuTitle($('title').text());

    $(window).scroll(function(){
        if ($(this).scrollTop() > $(this).height()) {
            $('#floatBar #scrollToTop').show();
        } else {
            $('#floatBar #scrollToTop').hide();
        }
    });

    $('#floatBar #scrollToTop').click(function () {
        $('html, body').animate({scrollTop : 0},400);
        return false;
    })

    $('#floatBar .section').mouseenter(function (e) {
        ga('send', 'event', 'floatBar', 'mouseEnter', e.currentTarget.id);
    })

    //Display float app download bar based on cookie
    if(_.isFunction($.cookie) && $.cookie('show-app-floatbar') === 'false'){
        $('.app-floatbar').hide()
    }else{
        if (window.team.isPhone() && !window.project.isMobileClient()) {
            if($('.floatBar_phone').length){
                $('.app-floatbar').css('bottom', $('.floatBar_phone').height() + 'px')
            }
            $('.app-floatbar').show()
        }
    }

    $('.app-floatbar-close').on('click',function(e){
        $('.app-floatbar').hide()
        if(_.isFunction($.cookie)) {
            $.cookie('show-app-floatbar',false,{ path: '/' })
        }
    })

    window.addEventListener('contextmenu', function(e) {
        if($(e.target).is('a')) {
            e.preventDefault()
            return false
        }
    })
})

