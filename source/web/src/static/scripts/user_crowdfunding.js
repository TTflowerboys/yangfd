/**
 * Created by zhou on 15-2-6.
 */
var mode
if (team.isPhone()) {
    mode = 1
} else {
    mode = 2
}
$('#earning').attr('rowspan', mode)
$('#overage').attr('colspan', mode)

$('.titleFrame tr .titleCell a').click(function () {
    var text = $(this).text()
    $.each($('.titleFrame tr .titleCell a'), function (i, val) {
        if ($(this).text() === text) {
            if($(this).parent().hasClass('selected')){
                return
            }else{
                $(this).parent().addClass('selected')
                changeMainPage(i)
            }
        }else{
            if($(this).parent().hasClass('selected')){
                $(this).parent().removeClass('selected')
            }
        }
    })
})
function changeMainPage(page) {
    $.each($('.contentFrame'), function (i, val) {
        console.log('page:'+page)
        console.log('i:'+i)
        console.log('val:'+$(this))

        if (i === page) {
            $(this).show()
        }else{
            $(this).hide()
        }
    })
}
