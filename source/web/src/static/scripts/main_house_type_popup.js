(function ($) {

    $( document ).ready(function(){
        var popup = $('#main_house_type_popup')
        window.closeMainHouseType = function(){
            //var popup = $('#main_house_type_popup')
            popup.hide()
        }

        window.openMainHouseType = function(event, floorplan, index) {
            //var popup = $('#main_house_type_popup')
            //Set up floorplan
            if (floorplan) {
                popup.find('.main_house_type_floorplan').attr('src', floorplan)
            }

            //Clone living room part from property detail
            popup.find('.main_house_type_info .table_wrapper .text').replaceWith($('#propertyDetails_houseTypes').find('.item'+index).find('.text')[0].cloneNode(true))

            //Clone area and value from property detail
            //popup.find('.main_house_type_info .text2:nth-child(2) .value').replaceWith($('#propertyDetails_houseTypes').find('.item'+index).find('.text2 tr td:nth-child(1) .value').cloneNode(true))
            //popup.find('.main_house_type_info .text2:nth-child(3) .value').replaceWith($('#propertyDetails_houseTypes').find('.item'+index).find('.text2 tr td:nth-child(2) .value').cloneNode(true))
            popup.show()
        }

        $('#main_house_type_popup_shadow').click(window.closeMainHouseType)
    })

})(jQuery)
