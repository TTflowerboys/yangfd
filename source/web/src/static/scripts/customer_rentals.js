$('#propertyType div').click(function () {

    var text = $(this).text()
    $.each($('#propertyType div'), function (i, val) {
        if ($(this).text() === text) {
            if ($(this).hasClass('selected')) {
                return
            } else {
                $(this).addClass('selected')
            }
        } else {
            if ($(this).hasClass('selected')) {
                $(this).removeClass('selected')
            }
        }
    })
})

$('#rentalType div').click(function () {

    var text = $(this).text()
    $.each($('#rentalType div'), function (i, val) {
        if ($(this).text() === text) {
            if ($(this).hasClass('selected')) {
                return
            } else {
                $(this).addClass('selected')
            }
        } else {
            if ($(this).hasClass('selected')) {
                $(this).removeClass('selected')
            }
        }
    })
})

$('#findAddress').click(function () {
    var address = $('#postcode')[0].value
    $.betterPost('http://maps.googleapis.com/maps/api/geocode/json?address=' + address)
        .done(function (val) {
            $('#neighborhood1')[0].value = val.results[0].address_components[1].long_name
            $('#locality')[0].value = val.results[0].address_components[2].long_name
        })
    $('#address').show()

})

$('#inputAddress').click(function () {
    $('#address').show()
})
$('#submit').click(function () {
    var images = []
    var imageSrc = uploadObj.getResponses()
    for (var i = 0; i < imageSrc.length; i += 1) {
        images.push(imageSrc[i].val.url)
    }
    var address = $('#locality')[0].value + $('#neighborhood1')[0].value + $('#neighborhood2')[0].value +
        $('#unit_name')[0].value + $('#unit_number')[0].value + $('#room_name')[0].value
    var propertyData = {
        'kitchen_count': $('#kitchen_count').children('option:selected').val(),
        'bathroom_count': $('#bathroom_count').children('option:selected').val(),
        'bedroom_count': $('#bedroom_count').children('option:selected').val(),
        'living_room_count': $('#living_room_count').children('option:selected').val(),
        'property_type': $('#propertyType .selected')[0].getAttribute('data-id'),
        'address': JSON.stringify({'zh_Hans_CN': address}),
        'name': JSON.stringify({'zh_Hans_CN': address}),
        'description': JSON.stringify({'zh_Hans_CN': $('#description')[0].value}),
        'reality_images': JSON.stringify({'zh_Hans_CN': images}),
        'zipcode': $('#postcode')[0].value
    }
    var ticketData = {
        'rent_type': $('#rentalType .selected')[0].getAttribute('data-id'),
        'deposit_type': $('#deposit_type').children('option:selected').val(),
        //'price': 1,
        'rent_period': $('#rent_period').children('option:selected').val(),
        //'rent_available_time': 1,
        'title': $('#title')[0].value
    }
    $.betterPost('/api/1/property/none/edit', propertyData)
        .done(function (val) {
            ticketData.property_id = val
            $.betterPost('/api/1/rent_ticket/none/edit', ticketData)
                .done(function (val) {
                })
        })
})
var uploadObj
$(document).ready(function () {
    uploadObj = $('#fileuploader').uploadFile({
        url: '/api/1/upload_image',
        fileName: 'data'
    });
});