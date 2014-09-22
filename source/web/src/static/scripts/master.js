$(window).on('resize', function () {
    $('#main').css({minHeight: $(window).height() - $('#copyright').height() - $('#footer').height() - $('#header').height()})
})
$(function () {
    $('#main').css({minHeight: $(window).height() - $('#copyright').height() - $('#footer').height() - $('#header').height()})
})

$(window).scroll(function(){
    if ($(this).scrollTop() > $(this).height()) {
        $('#floatWindow #scrollToTop').show();
    } else {
        $('#floatWindow #scrollToTop').hide();
    }
});

$('#floatWindow #scrollToTop').click(function () {
    $('html, body').animate({scrollTop : 0},400);
    return false;
})
