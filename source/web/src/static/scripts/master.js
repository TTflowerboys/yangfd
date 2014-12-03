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