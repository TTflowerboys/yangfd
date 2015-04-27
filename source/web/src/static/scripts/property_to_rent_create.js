(function(){
    //选择房产类型
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

    function showRoomOrHouse(text){
        if(text === i18n('单间')){
            $('[data-show=singleRoom]').show().siblings().hide()
        }else if(text === i18n('整租')){
            $('[data-show=entireHouse]').show().siblings().hide()
        }
    }
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
        showRoomOrHouse(text.trim())
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
    //验证表单,验证前会重置一下，隐藏上次验证的错误提示信息，遇到错误会把相应的表单变成红色边框，并且返回false
    function validateForm(form){
        var validate = true
        var errorMsg = ''
        var regex = {
            'email': /.+@.+\..+/,
            'nonDecimal': /[^0-9.\s,]/,
            'number': /^[0-9]+$/
        }
        form.find('[data-validator]').each(function(index, elem){
            var validator = $(elem).data('validator').split(',').map(function(v){
                return v.trim()
            })
            var value = $(this).val()
            if(validator.indexOf('trim') >= 0){
                value = value.trim()
            }
            if(validator.indexOf('required') >= 0 && value === ''){
                validate = false
                errorMsg = $(this).data('name') + i18n('不能为空')
            }
            for(var key in regex){
                if(validator.indexOf(key) >= 0 && !regex[key].test(value)){
                    errorMsg = $(this).data('name') + i18n('格式不正确')
                }
            }


            window.console.log(errorMsg)
        })
        return validate
    }
    /*//获取房产模型数据
    function getPropertyDataData(){

    }
    //获取出租单模型数据
    function getTicketDataData(){

    }*/
    $('#form1').submit(function (e) {
        if(validateForm($('#form1'))){
            window.console.log('Validatete Success!')
        }else{
            e.preventDefault()
            return false
        }
        var images = []
        var imageSrc = uploadObj.getResponses()
        for (var i = 0; i < imageSrc.length; i += 1) {
            images.push(imageSrc[i].val.url)
        }
        var address = $('#country')[0].value + $('#city')[0].value + $('#street')[0].value +
            $('#community')[0].value + $('#floor')[0].value + $('#house_name')[0].value
        var rentPrice = $('#price')[0].value
        if(rentPrice){
            $('sales_price_error').hide()
        }else{
            $('sales_price_error').show()
            return
        }
        if(startDate){
            $('date_error').hide()
        }else{
            $('date_error').show()
            return
        }
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
            'price': JSON.stringify({'unit': $('#unit').children('option:selected').val(), 'price': rentPrice}),
            'rent_period': $('#rent_period').children('option:selected').val(),
            'rent_available_time': startDate,
            'title': $('#title')[0].value
        }
        $.betterPost('/api/1/property/none/edit', propertyData)
            .done(function (val) {
                ticketData.property_id = val
                $.betterPost('/api/1/rent_ticket/none/edit', ticketData)
                    .done(function (val) {
                        //TODO 需要跳转
                    })
            })
    })
    var uploadObj
    $(document).ready(function () {
        uploadObj = $('#fileuploader').uploadFile({
            url: '/api/1/upload_image',
            fileName: 'data'
        });
        showRoomOrHouse($('#rentalType .property_type').eq(0).text().trim())
    });
    var startDate
    $('#rentPeriodStartDate')
        .val($.format.date(new Date(), 'yyyy-MM-dd'))
        .parent('.date').dateRangePicker({
            autoClose: true,
            singleDate: true,
            showShortcuts: false
        })
        .bind('datepicker-change', function (event, obj) {
            $(this).find('#rentPeriodStartDate').val($.format.date(new Date(obj.date1), 'yyyy-MM-dd'))
            if (obj.date1) {
                startDate = parseInt((new Date($.format.date(obj.date1, 'yyyy-MM-dd')) - 0) / 1000, 10)
            }
        })

    $('#load_more .load_more').click(function () {
        $('#load_more').hide()
        $('#more_information').show()
    })
    $('#more_region_highlight_handler').click(function () {
        $('#more_region_highlight_img').show()
        $('#more_region_highlight').show()
    })

    $('#more_region_highlight li').click(function () {
        var id = $(this)[0].getAttribute('data-id')
        var shouldAdd = true
        $.each($('#intentionTag li'), function (i, val) {
            if (id === $(this)[0].getAttribute('data-id')) {
                shouldAdd = false
            }
        })
        if (shouldAdd) {
            $('<li class="toggleTag selected" data-id="' + id + '">' +
            $(this)[0].innerText +
            '<img alt="" src="/static/images/intention/close.png"/></li>').insertBefore($('#more_region_highlight_panel'))
        }
    })

    $('#intentionTag').on('click', '.toggleTag img', function (event) {
        $(event.target).parent().remove()
    })
})()