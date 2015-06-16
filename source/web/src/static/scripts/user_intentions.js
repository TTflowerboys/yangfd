$(function () {
    //reload data or setup empty place holder
    var ticketArray = JSON.parse($('#dataTicketList').text())
    if (_.isEmpty(ticketArray)) {
        $('#emptyPlaceHolder').show()
    }
    else {
        _.each(ticketArray, function (ticket) {
            if (ticket.property) {
                var houseResult = _.template($('#houseCard_template').html())({ticket: ticket})
                $('#list').append(houseResult)
            }
            else {
                var intentionResult = _.template($('#intentionCard_template').html())({ticket: ticket})
                $('#list').append(intentionResult)
            }
        })
    }
})

bindItemWechatShareClick()

function bindItemWechatShareClick() {
    $('body').delegate('.wechatShare', 'click', function() {
        var intentionId = $(this).attr('data-id')
        var ticketArray = JSON.parse($('#dataTicketList').text())
        var property = _.first(_.where(ticketArray, {id: intentionId})).property
        openWeChatShare(property.id)
    })
}
function openWeChatShare (propertyId) {
    if (window.team.isWeChat()) {
        if (window.team.isWeChatiOS()) {
            $('.wechatPage_popup .buttonHolder').attr('src', '/static/images/property_details/wechat_share/phone/wechat_button_ios.png')
        }
        $('.wechatPage_popup').modal()
        $('.wechatPage_popup').find('.close-modal').hide()
    }
    else {
        location.href = '/wechat_share?property=' + propertyId
    }
}
