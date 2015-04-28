(function(){
    var imageArr = []
    $('#fileuploader').uploadFile({
        url: '/api/1/upload_image',
        fileName: 'data',
        //showProgress: true,
        showPreview: true,
        showDelete: true,
        showDone: false,
        previewWidth: '120px',
        previewHeight: '120px',
        showQueueDiv: 'uploadProgress',
        statusBarWidth: '140px',
        maxFileCount: 12, //最多上传12张图片
        deleteCallback: function(data, pd){
            var url = data.val.url
            var index = imageArr.indexOf(url)
            if(index >= 0){
                imageArr.splice(index, 1)
            }
        },
        onSuccess:function(files, data, xhr, pd){
            imageArr.push(data.val.url)
            pd.progressDiv.hide()
        }
    });
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
    //根据用户选择的单间或者整租类型来决定显示房间面积还是房屋面积
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
        function getLocationFromApiData(data, property){
            var location = ''
            if(data.results.length > 0){
                data.results[0].address_components.forEach(function(value){
                    if(value.types.indexOf(property) >= 0){
                        location = value.long_name
                    }
                })
            }
            return location
        }
        var address = $('#postcode').val()
        if(address !== ''){
            $.betterPost('http://maps.googleapis.com/maps/api/geocode/json?address=' + address)
                .done(function (data) {
                    $('#country').val(getLocationFromApiData(data, 'country'))
                    $('#city').val(getLocationFromApiData(data, 'locality'))
                })
        }
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
            'number': /^[0-9]+$/,
            'decimalNumber': /^\d+(\.(\d)+)?$/
        }
        $('.errorMsg').text('').hide()
        function highlightErrorElem(elem){
            elem.css('border', '2px solid #f00').on('focus', function(){
                $(this).css('border', '')
            })
        }
        function removeHighlightElem(elem){
            elem.css('border', '')
        }
        /*function showErrorMsg(elem, msg){
            highlightErrorElem(elem)
            elem.after('<div class="errorMsg" style="position: absolute;left: 0; margin-top: 5px;color: #f00;">' + msg + '</div>').parent().css('position', 'relative')
        }
        function removeErrorMsg(elem){
            removeHighlightElem(elem)
            elem.next('.errorMsg').remove().parent().css('position', '')
        }*/
        form.find('[data-validator]').each(function(index, elem){
            var validator = $(elem).data('validator').split(',').map(function(v){
                return v.trim()
            })
            var value = $(this).val()
            removeHighlightElem($(this))
            if(validator.indexOf('trim') >= 0){
                value = value.trim()
            }
            if(validator.indexOf('required') >= 0 && value === ''){
                validate = false
                errorMsg = $(this).data('name') + i18n('不能为空')
                highlightErrorElem($(this))
                //return false
            }
            for(var key in regex){
                if(value.length > 0 && validator.indexOf(key) >= 0 && !regex[key].test(value)){
                    validate = false
                    errorMsg = $(this).data('name') + i18n('格式不正确')
                    highlightErrorElem($(this))
                    //return false
                }
            }
        })
        if(imageArr.length === 0){
            validate = false
            errorMsg = i18n('请至少上传一张实景图')
        }
        if(!validate){
            //window.console.log(errorMsg)
            $('.errorMsg').text(errorMsg).show()
        }
        return validate
    }
    function getSpace(){
        return JSON.stringify({'unit': $('#spaceUnit').children('option:selected').val(), 'value': $('#roomSize').val()})
    }
    //获取房产模型数据
    function getPropertyData(options){
        var address = $('#country')[0].value + $('#city')[0].value + $('#street')[0].value +
            $('#community')[0].value + $('#floor')[0].value + $('#house_name')[0].value
        var indoorFacility = $.makeArray($('.indoorFacilities').find('input:checked').map(function(i,v){
            return $(v).val()
        }))
        var communityFacility = $.makeArray($('.communityFacilities').find('input:checked').map(function(i, v){
            return $(v).val()
        }))
        var regionHighlight = $.makeArray($('#intentionTag').find('.selected').map(function(i, v){
            return $(v).data('id')
        }))
        var propertyData = $.extend(options, {
            'name': JSON.stringify({'zh_Hans_CN': address}),
            'property_type': $('#propertyType .selected').data('id'),
            //'country': JSON.stringify({'value': {'zh_Hans_CN': $('#country').val()}}), //todo
            //'city': JSON.stringify({'value': {'zh_Hans_CN': $('#city').val()}}), //todo
            //'street': $('#street').val(), //todo
            'community': JSON.stringify({'zh_Hans_CN': $('#community').val()}),
            'floor': JSON.stringify({'zh_Hans_CN': $('#floor').val()}),
            'house_name': JSON.stringify({'zh_Hans_CN': $('#house_name').val()}),
            'address': JSON.stringify({'zh_Hans_CN': address}),
            'highlight': JSON.stringify({'zh_Hans_CN': []}), //todo?
            'reality_images': JSON.stringify({'zh_Hans_CN': imageArr}),
            'region_highlight': JSON.stringify(regionHighlight),
            'kitchen_count': $('#kitchen_count').children('option:selected').val(),
            'bathroom_count': $('#bathroom_count').children('option:selected').val(),
            'bedroom_count': $('#bedroom_count').children('option:selected').val(),
            'living_room_count': $('#living_room_count').children('option:selected').val(),
            'indoor_facility': JSON.stringify(indoorFacility),
            'community_facility': JSON.stringify(communityFacility),
            'real_address': JSON.stringify({'zh_Hans_CN': address}),
            'description': JSON.stringify({'zh_Hans_CN': $('#description').val()}),
            'zipcode': $('#postcode').val()
        })
        if($('#rentalType .selected').text().trim() === i18n('整租')){
            propertyData.building_area = getSpace()
        }
        return propertyData
    }
    //获取出租单模型数据
    function getTicketData(options){
        var ticketData = $.extend(options,{
            'rent_type': $('#rentalType .selected')[0].getAttribute('data-id'), //出租类型
            'deposit_type': $('#deposit_type').children('option:selected').val(), //押金方式
            'space': getSpace(), //面积
            'price': JSON.stringify({'unit': $('#unit').children('option:selected').val(), 'value': $('#price')[0].value }), //出租价格
            'bill_covered': $('#containFee').is(':checked'), //是否包物业水电费
            'rent_period': $('#rent_period').children('option:selected').val(), //出租多长时间
            'rent_available_time': new Date($('#rentPeriodStartDate').val()).getTime() / 1000, //出租开始时间
            'title': $('#title').val(),
            'description': $('#description').val()
        })
        return ticketData
    }
    $('#form1').submit(function (e) {
        e.preventDefault()
        if(!validateForm($('#form1'))){
            e.preventDefault()
            return false
        }
        var propertyData = getPropertyData({
            'status': 'draft', //将property设置为草稿状态，第二步发布时再不需要设置成草稿状态
        })

        /*$.betterPost('/api/1/property/none/edit', propertyData)
            .done(function (val) {
                ticketData.property_id = val
                $.betterPost('/api/1/rent_ticket/none/edit', ticketData)
                    .done(function (val) {
                        //TODO 需要跳转
                    })
            })*/
        var property_id = window.property_id || 'none'
        $.betterPost('/api/1/property/' + property_id + '/edit', propertyData)
            .done(function (val) {
                var ticketData = getTicketData({
                    'property_id': val,
                    'status': 'draft',
                })
                window.console.log(ticketData)

                $.betterPost('/api/1/rent_ticket/add', ticketData)
                    .done(function(val){
                        window.console.log(val)

                    })
            })
        return false
    })

    $(document).ready(function () {
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