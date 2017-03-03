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
        var $allRmm = $('.rmm-toggled')
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

    $('.rmm-toggled .rmm-toggled-controls .rmm-toggled-title').on('click', function (e) {
        var $ele = $(e.delegateTarget)
        var href = $ele.attr('data-href')
        if (href) {
            location.href = href
        }
        else {
            if (window.user) {
                window.project.goToUserSettings()
            }
            else {
                window.project.goToSignUp()
            }
        }
    });

    $('.rmm-toggled-controls .rmm-button').on('click',function(e){
        var $ele = $(e.delegateTarget)
        location.href = $ele.attr('data-href')
    });
});
/* 	hide mobile menu on resize */
$(window).resize(function () {
    adaptMenu();
});
