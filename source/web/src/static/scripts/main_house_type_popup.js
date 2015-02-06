(function ($) {

    $(document).ready(function () {
        var popup = $('#main_house_type_popup')
        var cIndex = 0
        var totalLength = 0

        window.closeMainHouseType = function () {
            popup.hide()
        }

        window.openMainHouseType = function (event, index,isPopupExist) {

            cIndex = parseInt(index)

            //Show slide when total length > 1
            totalLength = $('#propertyDetails_houseTypes').find('ul').children().length
            if (totalLength === 1) {
                popup.find('main_house_type a').hide()
            } else {
                popup.find('main_house_type a').show()
            }

            var wrapper = popup.find('.main_house_type_wrapper')
            wrapper.css('top', $(window).scrollTop() + 30)

            //Set up floorplan
            var floorplan = $('#propertyDetails_houseTypes').find('.item' + index).find('.floor_plan').attr('src').replace('_thumbnail','')
            if(floorplan !== ''){
                popup.find('.main_house_type_floorplan').attr('src', floorplan)
            }else{
                //To workaround onerror can not fire on firefox
                popup.find('.main_house_type_floorplan').addClass('withPlaceholder')
            }

            //Set name
            var name = $('#propertyDetails_houseTypes').find('.item' + index).find('.propertyDetails_houseType_name').text()
            popup.find('.main_house_type_header h1').text(name)

            //Clone living room part from property detail
            popup.find('.main_house_type_info .table_wrapper .text').replaceWith($('#propertyDetails_houseTypes').find('.item' + index).find('.text')[0].cloneNode(true))

            //Clone area and value from property detail
            popup.find('.main_house_type_info .space').empty().append($($('#propertyDetails_houseTypes').find('.item' + index).find('.text2 tr td')[0]).children().clone())
            popup.find('.main_house_type_info .price').empty().append($($('#propertyDetails_houseTypes').find('.item' + index).find('.text2 tr td')[1]).children().clone())

            //Set description
            var description = $('#propertyDetails_houseTypes').find('.item' + index).find('.propertyDetails_houseType_description').text()
            if (description === '') {
                popup.find('.main_house_type_info .description').hide()
            } else {
                popup.find('.main_house_type_info .description').show()
                $(popup.find('.main_house_type_info .description .value')).text(description)
            }

            popup.show()

            if(!isPopupExist){
                ga('send', 'event', 'property_detail', 'open', 'main-house-type-open',name)
            }
        }

        $('.main_house_type_next_area').click(function(){
            if (cIndex > 0) {
                window.openMainHouseType(null,cIndex - 1,true)
            } else if (cIndex === 0) {
                cIndex = totalLength - 1
                window.openMainHouseType(null,cIndex,true)
            }

            ga('send', 'event', 'property_detail', 'prev', 'main-house-type-popup-prev')
        })

        $('.main_house_type_prev_area').click(function(){
            if (cIndex < totalLength - 1) {
                window.openMainHouseType(null,cIndex + 1,true)
            } else if (cIndex === totalLength - 1) {
                cIndex = 0
                window.openMainHouseType(null,cIndex,true)
            }

            ga('send', 'event', 'property_detail', 'next', 'main-house-type-popup-next')
        })

        $('#main_house_type_popup_shadow').click(function(){
            window.closeMainHouseType()
            ga('send', 'event', 'property_detail', 'close', 'main-house-type-close')
        })
    })

})(jQuery)
