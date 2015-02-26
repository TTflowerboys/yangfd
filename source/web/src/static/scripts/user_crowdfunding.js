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

        if (i === page) {
            $(this).show()
        }else{
            $(this).hide()
        }
    })
}
$(function () {
    //reload data or setup empty place holder
    var orderArray = JSON.parse($('#dataOrderList').text())
    _.each(orderArray,function(order){
        console.log(order)

        var orderResult = _.template($('#transaction_list_item_template').html())({order: order})
        $('#transaction_list').append(orderResult)
    })
})
