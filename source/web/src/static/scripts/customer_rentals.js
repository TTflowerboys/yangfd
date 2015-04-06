$('.transactionType div').click(function () {

    var text = $(this).text()
    $.each($('.property_type div'), function (i, val) {
        if ($(this).text() === text) {
            if ($(this).hasClass('selected')) {
                return
            } else {
                $(this).addClass('selected')
                changeTransactionType(i)
            }
        } else {
            if ($(this).hasClass('selected')) {
                $(this).removeClass('selected')
            }
        }
    })
})

$('#typeApartment').click(function(){

    $('#typeApartment img').attr('src','/static/images/customer/btn_apartment_active.png');
    $('#typeVilla img').attr('src','/static/images/customer/btn_house_normal.png');
    $('#typeStudent img').attr('src','/static/images/customer/btn_student_normal.png');
})
$('#typeVilla').click(function(){

    $('#typeApartment img').attr('src','/static/images/customer/btn_apartment_normal.png');
    $('#typeVilla img').attr('src','/static/images/customer/btn_house_active.png');
    $('#typeStudent img').attr('src','/static/images/customer/btn_student_normal.png');
})
$('#typeStudent').click(function(){

    $('#typeApartment img').attr('src','/static/images/customer/btn_apartment_normal.png');
    $('#typeVilla img').attr('src','/static/images/customer/btn_house_normal.png');
    $('#typeStudent img').attr('src','/static/images/customer/btn_student_active.png');
})


$('#typeSingle').click(function(){

    $('#typeSingle img').attr('src','/static/images/customer/btn_apartment_active.png');
    $('#typeEntire img').attr('src','/static/images/customer/btn_house_normal.png');
    $('#typeRoommate img').attr('src','/static/images/customer/btn_rent_normal.png');
})
$('#typeEntire').click(function(){

    $('#typeSingle img').attr('src','/static/images/customer/btn_apartment_normal.png');
    $('#typeEntire img').attr('src','/static/images/customer/btn_house_active.png');
    $('#typeRoommate img').attr('src','/static/images/customer/btn_rent_normal.png');
})
$('#typeRoommate').click(function(){

    $('#typeSingle img').attr('src','/static/images/customer/btn_apartment_normal.png');
    $('#typeEntire img').attr('src','/static/images/customer/btn_house_normal.png');
    $('#typeRoommate img').attr('src','/static/images/customer/btn_rent_active.png');
})