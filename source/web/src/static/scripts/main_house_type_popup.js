(function ($) {

    $( document ).ready(function(){
        var popup = $('#main_house_type_popup')

        window.closeMainHouseType = function(){
            popup.hide()
        }

        window.openMainHouseType = function(event, floorplan, index) {
            //Set up floorplan
            if (floorplan) {
                popup.find('.main_house_type_floorplan').attr('src', floorplan)
            }

            //Clone living room part from property detail
            console.log(popup.find('.main_house_type_info .table_wrapper .text'))
            popup.find('.main_house_type_info .table_wrapper .text').replaceWith($('#propertyDetails_houseTypes').find('.item'+index).find('.text')[0].cloneNode(true))

            //Clone area and value from property detail
            popup.find('.main_house_type_info .space').empty().append($($('#propertyDetails_houseTypes').find('.item'+index).find('.text2 tr td')[0]).children().clone())
            popup.find('.main_house_type_info .price').empty().append($($('#propertyDetails_houseTypes').find('.item'+index).find('.text2 tr td')[1]).children().clone())
            popup.show()
        }

        $('#main_house_type_popup_shadow').click(window.closeMainHouseType)
    })

})(jQuery)
