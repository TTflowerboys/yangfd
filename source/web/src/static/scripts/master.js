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
