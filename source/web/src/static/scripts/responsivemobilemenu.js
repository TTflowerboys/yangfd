/*

 Responsive Mobile Menu v1.0
 Plugin URI: responsivemobilemenu.com

 Author: Sergio Vitov
 Author URI: http://xmacros.com

 License: CC BY 3.0 http://creativecommons.org/licenses/by/3.0/

 */

function responsiveMobileMenu() {
    $('.rmm').each(function () {

        $(this).children('ul').addClass('rmm-main-list');	// mark main menu list
        var $style = $(this).attr('data-menu-style');	// get menu style
        if (typeof $style === 'undefined' || $style === false) {
            $(this).addClass('graphite'); // set graphite style if style is not defined
        }
        else {
            $(this).addClass($style);
        }

        var $width = 0;

        $width = $(window).width()
        // if modern browser
        if ($.support.leadingWhitespace) {
            $(this).css('max-width', $width + 'px');
        }
        //
        else {
            $(this).css('width', $width + 'px');
        }
    });
}

function adaptMenu() {
    /* 	toggle menu on resize */
    $('.rmm').each(function () {

        $(this).css('width', $(window).width())
        if ($(window).width() < 768) {
            $(this).children('.rmm-main-list').hide(0);
            $(this).children('.rmm-toggled').show(0);
        }else {
            $(this).children('.rmm-main-list').show(0);
            $(this).children('.rmm-toggled').hide(0);
        }
    });
}

$(function () {
    responsiveMobileMenu();
    adaptMenu();

    /* slide down mobile menu on click */
    $('.rmm-toggled .rmm-toggled-controls .rmm-button').on('click', function () {
        var urlPath = location.pathname.split('/')
        var $allRmm = $('.rmm-toggled')
        
        if (urlPath[1] === 'user-chat' || urlPath[1] === 'user_chat') {
            if(urlPath.slice(-1)[0] === 'order'){
                //location.href = '/user-chat/'+(location.href.match(/user\-chat\/([0-9a-fA-F]{24})\/order/) || [])[1]+'/details'
                location.href = history.go(-1)
            }else{
                location.href = '/user-chat'
            }
        }else{
            _.each($allRmm, function (item) {
                var $rmm = $(item)

                $rmm.find('.rmm-center-menu').stop().hide();
                $rmm.addClass('rmm-center-closed');

                if ($rmm.is('.rmm-closed')) {
                    $rmm.find('.rmm-menu').stop().show(200);
                    $rmm.removeClass('rmm-closed');
                }
                else {
                    $rmm.find('.rmm-menu').stop().hide(200);
                    $rmm.addClass('rmm-closed');
                }
            })
        }
        
    });

    /* slide down mobile center menu on click */
    $('.rmm-toggled .rmm-toggled-controls .rmm-center').on('click', function () {
        var $allRmm = $('.rmm-toggled')

        _.each($allRmm, function (item) {
            var $rmm = $(item)
            if ($rmm.find('.rmm-center-menu')) {

                $rmm.find('.rmm-menu').stop().hide();
                $rmm.addClass('rmm-closed');
                if ($rmm.is('.rmm-center-closed')) {
                    $rmm.find('.rmm-center-menu').stop().show(200);
                    $rmm.find('.rmm-center-indicator').addClass('rotated')
                    $rmm.removeClass('rmm-center-closed');
                }
                else {
                    $rmm.find('.rmm-center-menu').stop().hide(200);
                    $rmm.find('.rmm-center-indicator').removeClass('rotated')
                    $rmm.addClass('rmm-center-closed');
                }
            }
        })

    });

    $('.rmm-toggled .rmm-toggled-controls .rmm-toggled-title').on('click', function () {
        if (window.user) {
            var urlPath = location.pathname.split('/')[1]
            var getRentIntentionTicketId = (location.href.match(/user\-chat\/([0-9a-fA-F]{24})\/details/) || [])[1]
            if (urlPath === 'user-chat' || urlPath === 'user_chat') {
                window.location.href = '/user-chat/'+getRentIntentionTicketId+'/order';
            }else{
                window.project.goToUserSettings()
            }
            
        }
        else {
            window.project.goToSignUp()
        }
    });

    $('.rmm-toggled-controls .rmm-button-back').on('click',function(){
        location.href = '/'
    });

    $('.rmm-toggled-controls .rmm-button-user').on('click',function(){
        location.href = '/user'
    });

    $('.rmm-toggled-controls .rmm-button-user-settings').on('click',function(){
        location.href = '/user_settings'
    });
});
/* 	hide mobile menu on resize */
$(window).resize(function () {
    adaptMenu();
});
