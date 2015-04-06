
$('#typeApartment').click(function () {

    $('#typeApartment img').attr('src', '/static/images/customer/btn_apartment_active.png');
    $('#typeVilla img').attr('src', '/static/images/customer/btn_house_normal.png');
    $('#typeStudent img').attr('src', '/static/images/customer/btn_student_normal.png');
})
$('#typeVilla').click(function () {

    $('#typeApartment img').attr('src', '/static/images/customer/btn_apartment_normal.png');
    $('#typeVilla img').attr('src', '/static/images/customer/btn_house_active.png');
    $('#typeStudent img').attr('src', '/static/images/customer/btn_student_normal.png');
})
$('#typeStudent').click(function () {

    $('#typeApartment img').attr('src', '/static/images/customer/btn_apartment_normal.png');
    $('#typeVilla img').attr('src', '/static/images/customer/btn_house_normal.png');
    $('#typeStudent img').attr('src', '/static/images/customer/btn_student_active.png');
})


$('#typeSingle').click(function () {

    $('#typeSingle img').attr('src', '/static/images/customer/btn_apartment_active.png');
    $('#typeEntire img').attr('src', '/static/images/customer/btn_house_normal.png');
    $('#typeRoommate img').attr('src', '/static/images/customer/btn_rent_normal.png');
})
$('#typeEntire').click(function () {

    $('#typeSingle img').attr('src', '/static/images/customer/btn_apartment_normal.png');
    $('#typeEntire img').attr('src', '/static/images/customer/btn_house_active.png');
    $('#typeRoommate img').attr('src', '/static/images/customer/btn_rent_normal.png');
})
$('#typeRoommate').click(function () {

    $('#typeSingle img').attr('src', '/static/images/customer/btn_apartment_normal.png');
    $('#typeEntire img').attr('src', '/static/images/customer/btn_house_normal.png');
    $('#typeRoommate img').attr('src', '/static/images/customer/btn_rent_active.png');
})

$('#findAddress').click(function () {
    var address = $('#postcode')[0].value
    $.betterPost('http://maps.googleapis.com/maps/api/geocode/json?address='+address)
        .done(function (val) {
            $('#neighborhood1')[0].value = val.results[0].address_components[1].long_name
            $('#locality')[0].value = val.results[0].address_components[2].long_name
        })
    $('#address').show()

})

$('#inputAddress').click(function () {
    $('#address').show()
})
$('#submit').click(function(){
    $.betterPost('/api/1/property/none/edit',{})
        .done(function (val) {

        })
})