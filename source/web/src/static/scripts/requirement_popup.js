$('.floatWindow #requirement').click(function () {
    $('#requirement_popup').show()
    $('#requirement').show()
})

$('#requirement_popup button[name=cancel]').click(function () {
    $('#requirement_popup').hide()
});
