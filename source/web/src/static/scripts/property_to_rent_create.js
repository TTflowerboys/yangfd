(function(){
    var imageArr = []
    var $errorMsg = $('.errorMsg')
    var $errorMsg2 = $('.errorMsg2')
    var $errorMsgOfGetCode = $('.errorMsgOfGetCode')
    var $requestSMSCodeBtn = $('#requestSMSCodeBtn')
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

    //一个简单的通过hash控制页面类容展示的机制
    function HashRoute(){
        var _ = this
        this.getHash = function getHash(){
            return location.hash.replace('#', '')
        }
        this.setHash = function setHash(hash){
            location.hash = hash
        }
        function hashChangeHanddler(){
            var params
            var hashArr = _.getHash().split('/')
            var isMatch = false
            var routes = Object.keys(_.router)
            $.each(routes, function(index, route){
                if(_.getHash() === ''){
                    _.router['/'] && _.router['/'].call(null)
                }
                if(route === _.getHash()){ //字符串完全匹配
                    _.router[route].call(null)
                    return
                }
                params = []
                isMatch = route.split('/').every(function(v, i){ //匹配hash中有参数的情况，参数前面加冒号
                    if(v.indexOf(':') === 0){
                        params.push(hashArr[i])
                        return true
                    }
                    if(v === hashArr[i]){
                        return true
                    }
                    return false
                })
                if(isMatch){
                    _.router[route].apply(null, params)
                    return
                }
            })
        }
        this.init = function init(){
            this.hash = this.getHash()
            this.router = {}
            $(window).bind('hashchange', hashChangeHanddler)
            $(document).ready(hashChangeHanddler) //页面直接载入时也要检查一下hash来执行对应的回调函数
        }
        this.init()
    }
    HashRoute.prototype.when = function(route, callback){ //注册hash路由和对应的处理函数
        this.router[route] = callback
        return this
    }
    HashRoute.prototype.locationHashTo = function(route){
        this.setHash(route)
        return this
    }

    var hashRoute = new HashRoute()
    hashRoute.when('/', function(){
        $('[data-route=step1]').show()
        $('[data-route=step2]').hide()
    }).when('/publish/:ticketid', function(ticketid){
        $('#previewIframe').attr('src', location.origin + '/wechat-poster/' + ticketid)
        $('[data-route=step1]').hide()
        $('[data-route=step2]').show()
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
        $errorMsg.text('').hide()
        function highlightErrorElem(elem){
            elem.css('border', '2px solid #f00').on('focus', function(){
                $(this).css('border', '')
            })
        }
        function removeHighlightElem(elem){
            elem.css('border', '')
        }
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
            $errorMsg.text(errorMsg).show()
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
            //'community': JSON.stringify({'zh_Hans_CN': $('#community').val()}),
            //'floor': JSON.stringify({'zh_Hans_CN': $('#floor').val()}),
            //'house_name': JSON.stringify({'zh_Hans_CN': $('#house_name').val()}),
            'address': JSON.stringify({'zh_Hans_CN': address}),
            //'highlight': JSON.stringify({'zh_Hans_CN': []}), //todo?
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
        if($('#community').val() !== ''){
            propertyData.community = JSON.stringify({'zh_Hans_CN': $('#community').val()})
        }
        if($('#floor').val() !== ''){
            propertyData.floor = JSON.stringify({'zh_Hans_CN': $('#floor').val()})
        }
        if($('#house_name').val() !== ''){
            propertyData.house_name = JSON.stringify({'zh_Hans_CN': $('#house_name').val()})
        }
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
            'rent_period': $('#rent_period').find('option:selected').val(), //出租多长时间
            'rent_available_time': new Date($('#rentPeriodStartDate').val()).getTime() / 1000, //出租开始时间
            //'title': $('#title').val(),
            //'description': $('#description').val()
        })
        if($('#title').val() !== ''){
            ticketData.title = $('#title').val()
        }
        if($('#description').val() !== ''){
            ticketData.description = $('#description').val()
        }
        return ticketData
    }

    $('#submit').click(function (e) {
        var $btn = $(this)
        e.preventDefault()
        if(!validateForm($('#form1'))){
            e.preventDefault()
            return false
        }
        var propertyData = getPropertyData({
            'status': 'draft', //将property设置为草稿状态，第二步发布时再不需要设置成草稿状态
        })

        var property_id = window.property_id || 'none'
        $btn.prop('disabled', true).text(window.i18n('发送中...'))
        $.betterPost('/api/1/property/' + property_id + '/edit', propertyData)
            .done(function (val) {
                var ticketData = getTicketData({
                    'property_id': val,
                    'status': 'draft',
                })
                //window.console.log(ticketData)
                $.betterPost('/api/1/rent_ticket/add', ticketData)
                    .done(function(val){
                        hashRoute.locationHashTo('/publish/' + val)
                        window.ticketId = val
                    }).fail(function (ret) {
                        $errorMsg.text(window.getErrorMessageFromErrorCode(ret)).show()
                    })
            }).fail(function (ret) {
                $errorMsg.text(window.getErrorMessageFromErrorCode(ret)).show()
                $btn.prop('disabled', false).text(window.i18n('重新发布'))
            })
        return false
    })

    //var startDate
    $('#rentPeriodStartDate')
        .val($.format.date(new Date(), 'yyyy-MM-dd'))
        .parent('.date').dateRangePicker({
            autoClose: true,
            singleDate: true,
            showShortcuts: false
        })
        .bind('datepicker-change', function (event, obj) {
            $(this).find('#rentPeriodStartDate').val($.format.date(new Date(obj.date1), 'yyyy-MM-dd'))
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

    /*
     *  Get sms verfication code
     * */
    $requestSMSCodeBtn.on('click', function (e) {
        $errorMsgOfGetCode.empty().hide()
        var $btn = $(this)
        // Check email and phone
        var valid = $.validate($('#form2'), {
            onError: function (dom, validator, index) {
                $errorMsgOfGetCode.empty()
                $errorMsgOfGetCode.text(window.getErrorMessage(dom.name, validator))
                $errorMsgOfGetCode.show()
            },
            exclude: ['code']
        })

        // Fast register user
        if (valid) {
            $btn.prop('disabled', true).text(window.i18n('发送中...'))

            var params = $('#form2').serializeObject({
                noEmptyString: true,
                exclude: ['code','rent_id']
            })
            console.log(params)
            $.betterPost('/api/1/user/fast-register', params)
                .done(function (val) {
                    window.user = val
                    $('.leftWrap').addClass('hasLogin').find('form').remove()
                    //ga('send', 'event', 'signup', 'result', 'signup-success')
                    //TODO: Count down 1 min to enable resend
                    //$requestSMSCodeBtn.prop('disabled', true)
                })
                .fail(function (ret) {
                    $errorMsgOfGetCode.empty()
                    $errorMsgOfGetCode.append(window.getErrorMessageFromErrorCode(ret))
                    $errorMsgOfGetCode.show()
                    $btn.text(window.i18n('重新获取验证码')).prop('disabled', false)
                })
        }
    })

    $('#publish').on('click', function(e) {
        $errorMsg2.empty().hide()
        var $btn = $(this)
        if(window.user){
            $btn.prop('disabled', true).text(window.i18n('发布中...'))
            $.betterPost('/api/1/rent_ticket/' + window.ticketId + '/edit', {'status': 'to rent'})
                .done(function(val) {
                    //todo
                    //跳转到发布成功页面
                    window.console.log('发布成功')
                })
        }
    })
    $(document).ready(function () {
        showRoomOrHouse($('#rentalType .property_type').eq(0).text().trim())
    });
})()