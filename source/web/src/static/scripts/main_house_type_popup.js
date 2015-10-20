(function ($) {

    $(document).ready(function () {
        var cIndex = 0

        if($('#propertyDetails_houseTypes_data').text() !== ''){
            var houseTypes = JSON.parse($('#propertyDetails_houseTypes_data').text())
            var totalLength = houseTypes.length

            if(houseTypes.length > 0){
                for(var i = 0;i<houseTypes.length;i++){
                    var houseTypeTpl = _.template($('#main_house_type_popup_template').html())({houseType: houseTypes[i],index:i})

                    //Show slide when total length > 1
                    if(houseTypes[i].floor_plan && houseTypes[i].floor_plan.length > 1){
                        $('.main_house_type_wrapper.item' + i).find('a.rslides_nav').show()
                    } else {
                        $('.main_house_type_wrapper.item' + i).find('a.rslides_nav').hide()
                    }
                    $('#main_house_type_popup').append(houseTypeTpl)

                    $('#main_house_type_popup').find('#floorplanSlider'+i).responsiveSlides({
                        pager: true,
                        auto: false,
                        nav: true,
                        prevText: '<',
                        nextText: '>'
                    })
                }

                $('#main_house_type_popup').find('.rslides_wrapper .leftPressArea').click(function (event) {
                    $(event.target).parent().find('a.prev').click()
                })

                $('#main_house_type_popup').find('.rslides_wrapper .rightPressArea').click(function (event) {
                    $(event.target).parent().find('a.next').click()
                })
            }
        }

        window.closeMainHouseType = function () {
            $('#main_house_type_popup').hide()
        }

        window.openMainHouseType = function (event, index,isPopupExist) {

            cIndex = parseInt(index)
            if(houseTypes && houseTypes.length>0 && cIndex>=0 && cIndex < houseTypes.length){

                for(var i = 0;i<houseTypes.length;i++){
                    if(i !== cIndex){
                        $('.main_house_type_wrapper.item'+i).hide()
                        $('.main_house_type_wrapper.item'+cIndex+' .main_house_type').hide()
                    }
                }
                $('.main_house_type_wrapper.item'+cIndex).show()
                $('.main_house_type_wrapper.item'+cIndex+' .main_house_type').fadeIn( 'slow', function() {
                    $('.main_house_type_wrapper.item'+cIndex+' .main_house_type').show()
                })
            }


            // Update popup position
            var wrapper = $('#main_house_type_popup').find('.main_house_type_wrapper')
            wrapper.css('top', $(window).scrollTop() + 30)

            $('#main_house_type_popup').show()

            if(!isPopupExist){
                ga('send', 'event', 'property_detail', 'open', 'main-house-type-open',name)
            }
        }

        $('.main_house_type_prev_area').click(function(){
            if (cIndex > 0) {
                window.openMainHouseType(null,cIndex - 1,true)
            } else if (cIndex === 0) {
                cIndex = totalLength - 1
                window.openMainHouseType(null,cIndex,true)
            }

            ga('send', 'event', 'property_detail', 'prev', 'main-house-type-popup-prev')
        })

        $('.main_house_type_next_area').click(function(){
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
