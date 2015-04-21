$(function () {
    var rentId = $('input[name=rent_id]').val()
    $('#contactRequestBtn').on('click', function (e) {

        if (window.user && rentId) {
            $.betterPost('/api/1/rent_ticket/' + rentId +'/contact_info')
                .done(function (val) {
                    var phone = val
                    $('.hostPhone span').text(phone)

                    $('.contactRequest').hide()
                })
                //TODO: issue #6317
                //.fail(function () {})
        }
        else {
            $('#contactRequestBtn').hide()
            $('.contactRequestForm').show()
        }
    })
})