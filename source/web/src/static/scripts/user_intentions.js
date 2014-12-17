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
                if (team.isPhone()) {
                    $('#list_phone').append(houseResult)
                } else {
                    $('#list').append(houseResult)
                }
            }
            else {
                var intentionResult = _.template($('#intentionCard_template').html())({ticket: ticket})
                if (team.isPhone()) {
                    $('#list_phone').append(intentionResult)
                } else {
                    $('#list').append(intentionResult)
                }
            }
        })
    }
})
