/*

 Responsive Mobile Menu v1.0
 Plugin URI: responsivemobilemenu.com

 Author: Sergio Vitov
 Author URI: http://xmacros.com

 License: CC BY 3.0 http://creativecommons.org/licenses/by/3.0/

 */

function responsiveMobileMenu() {	
    $('.rmm').each(function() {
	
	$(this).children('ul').addClass('rmm-main-list');	// mark main menu list
	var $style = $(this).attr('data-menu-style');	// get menu style
	if ( typeof $style === 'undefined' ||  $style === false )
	{
	    $(this).addClass('graphite'); // set graphite style if style is not defined
	}
	else {
	    $(this).addClass($style);
	}

	var $width = 0;

        $width = $(window).width()
	// if modern browser
	if ($.support.leadingWhitespace) {
	    $(this).css('max-width' , $width+'px');
	}
	// 
	else {
	    $(this).css('width' , $width+'px');
	}
    });
}
function getMobileMenu() {

    /* 	build toggled dropdown menu list */
    $('.rmm').each(function() {	
	var menutitle = $(this).attr('data-menu-title')
	if ( menutitle === '' ) {
	    menutitle = window.i18n('注册');
	}
	else if ( menutitle === undefined ) {
	    menutitle = window.i18n('注册');
	}
	var $menulist = $(this).children('.rmm-menu').html();
        var $menuTextButton = '<div class="rmm-toggled-title">' + '<img src="/static/images/common/header/phone/user.png" />'+ '</div>'
        var $menuButton = '<div class="rmm-button"><img src="/static/images/common/header/phone/menu.png"/></div>'
        var $menuCenterButton = '<div class="rmm-center">' + window.i18n('洋房东') + '</div>'
        if ($(this).find('.rmm-custom-center').length) {
            $menuCenterButton = $(this).find('.rmm-custom-center').html()
        }
	var $menucontrols ='<div class="rmm-toggled-controls">' + $menuButton  + $menuCenterButton + $menuTextButton + '</div>'

        var $centerMenulist = ''
        if ($(this).children('.rmm-center-menu').length) {
            $centerMenulist = '<ul class="rmm-center-menu">' + $(this).children('.rmm-center-menu').html() + '</ul>'
        }
        
	$(this).prepend('<div class="rmm-toggled rmm-closed rmm-center-closed">'+$menucontrols+'<ul class="rmm-menu">'+$menulist+'</ul> ' + $centerMenulist +  '</div>')
    });
}

function adaptMenu() {
    /* 	toggle menu on resize */
    $('.rmm').each(function() {

        $(this).css('width', $(window).width())
	if ($(window).width() < 768 ) {
	    $(this).children('.rmm-main-list').hide(0);
	    $(this).children('.rmm-toggled').show(0);
	}
	else {
	    $(this).children('.rmm-main-list').show(0);
	    $(this).children('.rmm-toggled').hide(0);
	}
    });
}

$(function() {
    responsiveMobileMenu();
    getMobileMenu();
    adaptMenu();

    /* slide down mobile menu on click */
    $('.rmm-toggled .rmm-toggled-controls .rmm-button').on('click', function(){
        var $allRmm = $('.rmm-toggled')

        _.each($allRmm, function(item) {
            var $rmm = $(item)

            $rmm.find('.rmm-center-menu').stop().hide();
	    $rmm.addClass('rmm-center-closed');

	    if ( $rmm.is('.rmm-closed')) {
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
    $('.rmm-toggled .rmm-toggled-controls .rmm-center').on('click', function(){
        var $allRmm = $('.rmm-toggled')

        _.each($allRmm, function (item) {
            var $rmm = $(item)
            if ($rmm.find('.rmm-center-menu')) {

                $rmm.find('.rmm-menu').stop().hide();
	        $rmm.addClass('rmm-closed');
                if ( $rmm.is('.rmm-center-closed')) {
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
    
    $('.rmm-toggled .rmm-toggled-controls .rmm-toggled-title').on('click', function(){
        if (window.user) {
            window.project.goToUserSettings()
        }
        else {
            window.project.goToSignUp()
        }
    });
});
/* 	hide mobile menu on resize */
$(window).resize(function() {
    adaptMenu();
});
