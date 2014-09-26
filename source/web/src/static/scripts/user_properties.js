
$('.list').on('click', '.houseCard #removeProperty', function (event) {
    var ticketId = $(event.target).attr('data-id')
    $.post('/api/1/intention_ticket/' + ticketId + '/remove')
        .done(function (data) {
            location.reload()
        })
        .fail (function (ret) {
            window.alert(window.i18n('移除失败'))
        })
})
