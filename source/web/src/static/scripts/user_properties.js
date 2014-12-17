$(function () {
    //reload data or setup empty place holder
    var ticketArray = JSON.parse($('#dataTicketList').text())
    if (_.isEmpty(ticketArray)) {
        $('#emptyPlaceHolder').show()
    }
    else {
        _.each(ticketArray, function (ticket) {
            var houseResult = _.template($('#houseCard_template').html())({ticket: ticket})
            if(team.isPhone()){
                $('#list_phone').append(houseResult)
            }else {
                $('#list').append(houseResult)
            }
        })
    }
})

$('#list').on('click', '.houseCard #removeProperty', function (event) {
    var ticketId = $(event.target).attr('data-id')
    $.betterPost('/api/1/intention_ticket/' + ticketId + '/remove')
        .done(function (data) {
            location.reload()
        })
        .fail (function (ret) {
            window.alert(window.i18n('移除失败'))
        })
})
