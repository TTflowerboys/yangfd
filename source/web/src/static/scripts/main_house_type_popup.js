(function ($) {

    $( document ).ready(function(){
        var popup = $('#main_house_type_popup')

        window.closeMainHouseType = function(){
            popup.hide()
        }

        window.openMainHouseType = function(event,index, floorplan,name,description ) {

            var wrapper = popup.find('.main_house_type_wrapper')
            wrapper.css('top', $(window).scrollTop() + 30)

            //Set up floorplan
            if (floorplan) {
                popup.find('.main_house_type_floorplan').attr('src', floorplan)
            }

            //Set name
            popup.find('.main_house_type_header h1').text(name)

            //Clone living room part from property detail
            popup.find('.main_house_type_info .table_wrapper .text').replaceWith($('#propertyDetails_houseTypes').find('.item'+index).find('.text')[0].cloneNode(true))

            //Clone area and value from property detail
            popup.find('.main_house_type_info .space').empty().append($($('#propertyDetails_houseTypes').find('.item'+index).find('.text2 tr td')[0]).children().clone())
            popup.find('.main_house_type_info .price').empty().append($($('#propertyDetails_houseTypes').find('.item'+index).find('.text2 tr td')[1]).children().clone())

            //Set description
            if(description===''){
                popup.find('.main_house_type_info .description').hide()
            }else{
                popup.find('.main_house_type_info .description .value').val(description)
            }

            popup.show()
        }

        $('#main_house_type_popup_shadow').click(window.closeMainHouseType)
    })

})(jQuery)
