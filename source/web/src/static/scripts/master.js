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
    if($.cookie('show-app-floatbar') === 'false'){
        $('.app-floatbar').hide()
    }else{
        if (window.team.isPhone() && !window.project.isMobileClient()) {
            $('.app-floatbar').show()
        }
    }

    $('.app-floatbar-close').on('click',function(e){
        $('.app-floatbar').hide()
        $.cookie('show-app-floatbar',false)
    })

    //TODO: do this for for production sync
    var $rentHeaderItem = $('.rentHeaderItem')
    if(team.isProduction()){

        // Display header buttons and tabs based on whether user have beta_renting role or not
        if(!_.isEmpty(window.user.role) && _.indexOf(window.user.role,'beta_renting') !== -1){
            $rentHeaderItem.show()
        }else{
            $rentHeaderItem.hide()
        }

    }else {
        $rentHeaderItem.show()
    }
})

