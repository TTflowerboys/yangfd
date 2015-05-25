(function(){
    var imageArr
    if($('#fileuploader').data('files') !== undefined) {
        imageArr = $('#fileuploader').data('files').split(',')
    }else{
        imageArr = []
    }
    var $errorMsg = $('.errorMsg')
    var $errorMsg2 = $('.errorMsg2')
    var $errorMsgOfGetCode = $('.errorMsgOfGetCode')
    var $requestSMSCodeBtn = $('#requestSMSCodeBtn')
    window.propertyId = $('#submit').data('propertyid') || 'none'
    window.ticketId = $('#publish').data('ticketid') || location.hash.split('#/publish/')[1]
    var createStartTime = new Date()
    var smsSendTime

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
                if(_.getHash() === '' && _.router['/']){
                     _.router['/'].call(null)
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
    function showRoute1() {
        $('[data-route=step1]').show()
        $('[data-route=step2]').hide()
    }
    hashRoute.when('/', function(){
        showRoute1()
    }).when('/publish/:ticketid', function(ticketid){
        ga('send', 'pageview', '/property-to-rent/publish/'+ticketid)
        window.previewIframe.window.isInit = false
        window.previewMoveTo(0)
        $('#previewIframe').attr('src', location.protocol + '//' + location.host + '/wechat-poster/' + ticketid)
        $('[data-route=step1]').hide()
        $('[data-route=step2]').show()
        initInfoHeight()
    }).when('/1', function() {
        ga('send', 'event', 'property_to_rent_create', 'return-to-edit', 'edit-cover')

        showRoute1()
        $('#load_more .load_more').trigger('click')
        $('body,html').stop(true,true).animate({scrollTop: 1870}, 500)
    }).when('/2', function() {
        ga('send', 'event', 'property_to_rent_create', 'return-to-edit', 'edit-property-detail')

        showRoute1()
        $('body,html').stop(true,true).animate({scrollTop: 657}, 500)
    }).when('/3', function() {
        ga('send', 'event', 'property_to_rent_create', 'return-to-edit', 'edit-description-facilities')

        showRoute1()
        $('#load_more .load_more').trigger('click')
        $('#description').trigger('focus')
        $('body,html').stop(true,true).animate({scrollTop: 1870}, 500)
    }).when('/4', function() {
        ga('send', 'event', 'property_to_rent_create', 'return-to-edit', 'edit-address')

        showRoute1()
        $('#postcode').trigger('focus')
        $('body,html').stop(true,true).animate({scrollTop: 763}, 500)

    }).when('/5', function() {
        ga('send', 'event', 'property_to_rent_create', 'return-to-edit', 'edit-pics')

        showRoute1()
        $('#fileuploader').trigger('hover')
        $('body,html').stop(true,true).animate({scrollTop: 478}, 500)
    }).when('/6', function() {
        ga('send', 'event', 'property_to_rent_create', 'return-to-edit', 'edit-region')

        showRoute1()
        $('#inputAddress').trigger('click')
        $('#block').trigger('focus')
        $('body,html').stop(true,true).animate({scrollTop: 763}, 500)
    })

    //根据用户选择的单间或者整租类型来决定显示房间面积还是房屋面积
    function showRoomOrHouse(id){
        if(id === '552396b54d159c0feb6c640c'){
            $('[data-show=singleRoom]').show().siblings().hide()
        }else if(id === '552396c24d159c0feb6c640e'){
            $('[data-show=entireHouse]').show().siblings().hide()
        }
    }

    $('#rentalType div').click(function () {
        var id = $(this).data('id')
        $.each($('#rentalType div'), function (i, val) {
            if ($(this).data('id') === id) {
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
        showRoomOrHouse(id)
    })

    /*postcode 和地址部分*/
    $('.select-chosen').chosen({width: '87%', disable_search_threshold: 8 }) //调用chosen插件
    $('#country-select').bind('change', function () {
        $('#city-select').html('').trigger('chosen:updated')
        getCityListForSelect($('#country-select').val())
    })
    function getCountryList() { //通过window.team.countryMap来获取国家列表

        $('#country-select').append(
            _.reduce(JSON.parse($('#countryData').text()), function(pre, val, key) {
                return pre + '<option value="' + val.code + '">' + window.team.countryMap[val.code] + '</option>'
            }, '<option value="">' + i18n('请选择国家') + '</option>')
        ).trigger('chosen:updated')
        bindDataModel()
    }
    function GeonamesApi () {
        var url = '/api/1/geonames/search'
        this.getAdmin = function (config, callback, reject) {
            $.betterPost(url, config)
                .done(function (val) {
                    callback.call(null, val)
                })
                .fail(function (ret) {
                    if(reject && typeof reject === 'function') {
                        reject(ret)
                    }
                })
        }
        this.getCity = function (country, callback, reject) {
            this.getAdmin({
                country: country,
                feature_code: 'city'
            }, callback, reject)
        }
        this.getAdmin1 = function (country, callback, reject) {
            this.getAdmin({
                country: country,
                feature_code: 'ADM1'
            }, callback, reject)
        }
        this.getAdmin2 = function (country, admin1, callback, reject) {
            this.getAdmin({
                country: country,
                admin1: admin1,
                feature_code: 'ADM2'
            }, callback, reject)
        }
        this.getCityByLocation = function (country, latitude, longitude, callback, reject) {
            this.getAdmin({
                search_range: 50000,
                country: country,
                latitude: latitude,
                longitude: longitude,
                feature_code: 'city'
            }, callback, reject)
        }
    }
    var geonamesApi = new GeonamesApi()
    getCountryList()

    function bindDataModel() { //将带有data-model的下拉列表与对应的隐藏表单数据简单的绑定
        $('[data-model]').each(function(index, elem) {
            //todo 暂时不考虑编辑页的问题
            var val = $('#' + $(elem).attr('data-model')).val()
            var text = $('#' + $(elem).attr('data-model')).data('text')
            if($(elem).attr('id') !== 'country-select' && val !== '') {
                $(elem).html('<option value="">' + i18n('请选择城市') + '</option>' + '<option value="' + val + '">' + text + '</option>')
            }
            $(elem).val(val).trigger('change').trigger('chosen:updated')
            $(elem).bind('change', function() {
                $('#' + $(elem).data('model')).val($(elem).val())
            })
        })
    }

    function getCityListForSelect(country) {
        if(!country){
            return
        }
        var $span = $('#city_select_chosen .chosen-single span')
        var originContent = $span.html()
        $span.html(window.i18n('城市列表加载中...'))
        geonamesApi.getCity(country, function (val) {
            if(country === $('#country-select').val()) {
                $span.html(originContent)
                $('#city-select').html(
                    _.reduce(val, function(pre, val, key) {
                        return pre + '<option value="' + val.id + '">' + val.name + (country === 'US' ? ' (' + val.admin1 + ')' : '') + '</option>' //美国的城市有很多重名，要在后面加上州名缩写
                    }, '<option value="">' + i18n('请选择城市') + '</option>')
                ).trigger('chosen:updated')
                if($('#city').val()) {
                    $('#city-select').val($('#city').val()).trigger('chosen:updated')
                }else {
                    $('#city-select').trigger('chosen:open')
                }
            }
        })
    }


    $('#findAddress').click(function () {
        /*function getLocationFromApiData(data, property){
            var location = ''
            if(data.results.length > 0){
                $.each(data.results[0].address_components, function(index, value){
                    if(value.types.indexOf(property) >= 0){
                        location = value.long_name
                    }
                })
            }
            return location
        }
        function getGeometryFromApiData(data, property) {
            var location
            if(data.results.length > 0 && data.results[0].geometry && data.results[0].geometry.location){
                location = data.results[0].geometry.location[property]
            }
            return location
        }
        var $btn = $(this)
        var address = $('#postcode').val()
        if(address !== ''){
            $btn.prop('disabled', true).text(window.i18n('获取中...'))
            $.betterPost('http://maps.googleapis.com/maps/api/geocode/json?address=' + address)
                .done(function (data) {
                    $('#country').val(getLocationFromApiData(data, 'country'))
                    $('#city').val(getLocationFromApiData(data, 'locality'))
                    $('#latitude').val(getGeometryFromApiData(data, 'lat'))
                    $('#longitude').val(getGeometryFromApiData(data, 'lng'))
                    $btn.prop('disabled', false).text(window.i18n('重新获取'))
                }).fail(function (err) {
                    $errorMsg.text(err).show()
                    $btn.prop('disabled', false).text(window.i18n('重新获取'))
                }).always(function() {
                    $('#address').show()
                })
        }*/
        //使用新的 /api/1/postcode/search API
        //var country = 'GB' //todo 暂时将API要传的country字段写死为英国
        var $btn = $(this)
        var postcodeIndex = $('#postcode').val().replace(/\s/g, '')
        function clearLocationData () {
            $('#city-select').find('option').eq(0).attr('selected',true)
            $('#city-select').trigger('chosen:updated')
            $('#city').val('')
            $('#country-select').find('option').eq(0).attr('selected',true)
            $('#country-select').trigger('chosen:updated')
            $('#country').val('')
            $('#latitude').val('')
            $('#longitude').val('')
        }
        function fillAdress(val) { //使用postcode查询得来得数据中得一条来填充表单项
            $('#country-select').val(val.country).trigger('chosen:updated')
            $('#country').val(val.country)
            //$('#city-select').html('<option value="' + val.admin1 + '">' + val.admin1_name + '</option>').val(val.admin1).trigger('chosen:updated')
            //$('#city').val(val.admin1)
            $('#latitude').val(val.loc[1])
            $('#longitude').val(val.loc[0])
            geonamesApi.getCityByLocation(val.country, val.loc[1], val.loc[0], function (val) {
                $('#city-select').html(
                    _.reduce(val, function(pre, val, key) {
                        return pre + '<option value="' + val.id + '"' + (key === 0 ? 'selected' : '') + '>' + val.name + (val.country === 'US' ? ' (' + val.admin1 + ')' : '') + '</option>' //美国的城市有很多重名，要在后面加上州名缩写
                    }, '<option value="">' + i18n('请选择城市') + '</option>')
                ).trigger('chosen:updated').trigger('change')
            })
            $('#address').show()
        }
        function chooseOneResultOfPostcodeSearch (val) {
            $('.chosen-address').show()
            var $chosenResults = $('.chosen-address .chosen-results')
            function keydownHanddler (e) {
                switch(e.keyCode) {
                    case 38: //上
                        if($chosenResults.find('li.result-selected').index() > 0) {
                            $chosenResults.find('li').eq($chosenResults.find('li.result-selected').index() - 1).addClass('result-selected').siblings().removeClass('result-selected')
                        }
                        break;
                    case 40: //下
                        if($chosenResults.find('li.result-selected').index() < $chosenResults.find('li').length - 1) {
                            $chosenResults.find('li').eq($chosenResults.find('li.result-selected').index() + 1).addClass('result-selected').siblings().removeClass('result-selected')
                        }
                        break;
                    case 13: //回车
                        choose(val, $chosenResults.find('li.result-selected').index())
                        break;
                }
            }
            function choose (val, index) {
                fillAdress(val[index])
                $('.chosen-address').hide()
                $('#address').show()
                $(window).unbind('keydown', keydownHanddler)
            }
            $(window).bind('keydown', keydownHanddler)
            $chosenResults.html(_.reduce(val, function (pre, v, i) {
                var addressArr = []
                if(v.country) {
                    addressArr.push(v.country)
                }
                if(v.admin1_name) {
                    addressArr.push(v.admin1_name)
                }
                if(v.admin2_name) {
                    addressArr.push(v.admin2_name)
                }
                if(v.admin3_name) {
                    addressArr.push(v.admin3_name)
                }
                if(v.place_name) {
                    addressArr.push(v.place_name)
                }
                return pre + '<li class="active-result" data-option-array-index="' + i + '">' + addressArr.join(' ') + '</li>'
            }, ''))
                .find('li')
                .on('mouseover', function () {
                    $(this).addClass('result-selected').siblings().removeClass('result-selected')
                })
                .on('click', function () {
                    var index = $(this).data('option-array-index')
                    choose(val, index)
                })
                .eq(0).addClass('result-selected')
        }
        if(postcodeIndex !== '') {
            $btn.prop('disabled', true).text(window.i18n('获取中...'))
            $.betterPost('/api/1/postcode/search', 'postcode_index=' + postcodeIndex)
                .done(function(val) {
                    switch(val.length) {
                        case 0: //postcode没有搜索到结果则需要用户手动选择国家城市
                            clearLocationData()
                            $('#address').show()
                            break;
                        case 1: //搜索到一条结果则直接填充到对应到字段
                            fillAdress(val[0])
                            break;
                        default: //搜索到多条结果需要用户选择其中一条
                            chooseOneResultOfPostcodeSearch(val)
                            break;
                    }
                })
                .fail(function(err) {
                    $errorMsg.text(err).show()
                    $('#address').show()
                })
                .always(function() {
                    $btn.prop('disabled', false).text(window.i18n('重新获取'))
                })
        }
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
            var $this = $(this)
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
            $.each(validator, function(i, v){
                if(/maxLength\((\d+)\)/.test(v)) {
                    var maxLength = parseInt(v.match(/maxLength\((\d+)\)/)[1])
                    if(value.length > maxLength){
                        validate = false
                        errorMsg = $this.data('name') + i18n('超出长度限制')
                        highlightErrorElem($this)
                    }
                }
            })
        })
        /*if(imageArr.length === 0){
            validate = false
            errorMsg = i18n('请至少上传一张实景图')
        }*/
        var isUploading = false
        $('.ajax-file-upload-progress').each(function(i, v){
            if(v.style.display !== 'none') {
                isUploading = true
            }
        })
        if(isUploading){
            validate = false
            errorMsg = i18n('图片正在上传中，请稍后再发布')
        }
        if(!validate){
            //window.console.log(errorMsg)
            $errorMsg.text(errorMsg).show()
        }
        return validate
    }

    function getSpace(){
        if($('#roomSize').val() === '') {
            return false
        }
        return JSON.stringify({'unit': $('#spaceUnit').children('option:selected').val(), 'value': $('#roomSize').val()})
    }

    //获取房产模型数据
    function getPropertyData(options){
        /*var address = $('#country')[0].value + $('#city')[0].value + $('#street')[0].value +
            $('#community')[0].value + $('#floor')[0].value + $('#house_name')[0].value*/
        var address = $('#community')[0].value + $('#floor')[0].value + $('#house_name')[0].value
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
            'country': $('#country').val(), //todo
            'city': $('#city').val(), //todo
            'street': JSON.stringify({'zh_Hans_CN': $('#street').val()}), //todo
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
            'zipcode': $('#postcode').val(),
            'user_generated': true
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
        if($('#rentalType .selected').text().trim() === i18n('整租') && getSpace() !== false){
            propertyData.building_area = getSpace()
        }
        if($('#latitude').val() !== '') {
            propertyData.latitude = $('#latitude').val()
        }
        if($('#longitude').val() !== '') {
            propertyData.longitude = $('#longitude').val()
        }
        return propertyData
    }

    //获取出租单模型数据
    function getTicketData(options){
        var title = $('#title').val() || $('#block').val() + ' ' + $('#bedroom_count').children('option:selected').val() + window.i18n('居室') + $('#rentalType .selected').text().trim() + window.i18n('出租') //如果用户没有填写title，默认为街区+居室+出租类型，比如“Isle of Dogs三居室单间出租”
        var ticketData = $.extend(options,{
            'rent_type': $('#rentalType .selected')[0].getAttribute('data-id'), //出租类型
            'deposit_type': $('#deposit_type').children('option:selected').val(), //押金方式
            'price': JSON.stringify({'unit': $('#unit').children('option:selected').val(), 'value': $('#price')[0].value }), //出租价格
            'bill_covered': $('#billCovered').is(':checked'), //是否包物业水电费
            //'rent_period': $('#rent_period').val(), //出租多长时间
            'rent_available_time': new Date($('#rentPeriodStartDate').val()).getTime() / 1000, //出租开始时间
            'title': title,
        })
        if($('#description').val() !== ''){
            ticketData.description = $('#description').val()
        }
        if(getSpace() !== false) {
            ticketData.space = getSpace() //面积
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

        $btn.prop('disabled', true).text(window.i18n('发布中...'))
        $.betterPost('/api/1/property/' + window.propertyId + '/edit', propertyData)
            .done(function (val) {
                if(typeof val === 'string') {
                    window.propertyId = val
                }
                var ticketData = getTicketData({
                    'property_id': val,
                    'status': 'draft',
                })
                var ticketApi
                //window.console.log(ticketData)
                if(window.ticketId){
                    ticketApi = '/api/1/rent_ticket/' + window.ticketId + '/edit'
                }else{
                    ticketApi = '/api/1/rent_ticket/add'
                }
                $.betterPost(ticketApi, ticketData)
                    .done(function(val){
                        if(!window.ticketId) {
                            hashRoute.locationHashTo('/publish/' + val)
                            window.ticketId = val
                        }
                        else{
                            hashRoute.locationHashTo('/publish/' + window.ticketId)
                        }
                        $btn.prop('disabled', false).text(window.i18n('预览并发布'))

                        //
                        ga('send', 'event', 'property_to_rent_create', 'time-consuming', 'first-step', (new Date() - createStartTime)/1000)
                    })
                    .fail(function (ret) {
                        $errorMsg.text(window.getErrorMessageFromErrorCode(ret)).show()
                        $btn.prop('disabled', false).text(window.i18n('预览并发布'))
                    })
            }).fail(function (ret) {
                $errorMsg.text(window.getErrorMessageFromErrorCode(ret)).show()
                $btn.prop('disabled', false).text(window.i18n('预览并发布'))
            })
        return false
    })

    //startDate
    if($('#rentPeriodStartDate').val() === ''){
        $('#rentPeriodStartDate').val($.format.date(new Date(), 'yyyy-MM-dd'))
    }
    $('#rentPeriodStartDate')

        .parent('.date').dateRangePicker({
            autoClose: true,
            singleDate: true,
            showShortcuts: false
        })
        .bind('datepicker-change', function (event, obj) {
            $(this).find('#rentPeriodStartDate').val($.format.date(new Date(obj.date1), 'yyyy-MM-dd'))
        })

    $('#load_more .load_more').click(function () {
        var defaultTitle = $('#block').val() ? $('#block').val() + ' ' : '' + $('#bedroom_count').children('option:selected').val() + window.i18n('居室') + $('#rentalType .selected').text().trim() + window.i18n('出租')
        $('#load_more').hide()
        if($('#title').val() === ''){
            $('#title').val(defaultTitle)
        }
        $('#more_information').show()

        ga('send', 'event', 'property_to_rent_create', 'click', 'enter_more')
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
            smsSendTime = new Date()

            var params = $('#form2').serializeObject({
                noEmptyString: true,
                exclude: ['code','rent_id']
            })
            window.console.log(params)
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
                    location.href = '/property-to-rent/' + window.ticketId + '/publish-success'

                    ga('send', 'event', 'property_to_rent_create', 'time-consuming', 'sms-receive', (new Date() - smsSendTime)/1000)
                    ga('send', 'event', 'property_to_rent_create', 'time-consuming', 'finish-publish', (new Date() - createStartTime)/1000)
                })
                .fail(function (ret) {
                    $errorMsg2.empty()
                    $errorMsg2.append(window.getErrorMessageFromErrorCode(ret))
                    $errorMsg2.show()
                    $btn.text(window.i18n('重新发布')).prop('disabled', false)
                })
        }
    })
    window.previewMoveTo = function(num){ //给iframe中的微信预览页调用的方法
        if(typeof num !== 'number' || num < 0 || num >5){
            throw('Num must be an interger between 0 and 5!')
        }
        $('.infoBox dl.info').find('dt,dd').each(function(i, v){
            if(i === num * 2 || i === num * 2 + 1){
                $(v).addClass('active')
            }else{
                $(v).removeClass('active')
            }
        })
    }
    window.previewLoaded = function() { //Issue #5996:  预览效果这里如果没有加载完成，右边的页面选择就不应该可以调
        $('.infoBox dl.info').find('dt,dd').click(function(){ //点击文案后微信预览页滚动到对应位置
            if(window.previewIframe && window.previewIframe.window.isInit === true){
                var index = Math.floor($(this).index() / 2)
                if(window.previewIframe && window.previewIframe.window && typeof window.previewIframe.window.wechatSwiperMoveTo === 'function') {
                    window.previewMoveTo(index)
                    window.previewIframe.window.wechatSwiperMoveTo(index)
                    initInfoHeight()
                }
            }
        })
    }
    if(location.href.indexOf('create') > 0 && window.ticketId !== undefined){ //如果是在新建页，则需要将编辑的地址改成下面这样的，防止用户刷新页面后表单数据没有东西填充了
        $('.infoBox dl.info').find('a').each(function() {
            var hash = $(this).attr('href')
            $(this).attr('href', '/property-to-rent/' + window.ticketId + '/edit' + hash)
        })
    }
    function initInfoHeight(){
        $('.infoBox .info').css('height', $('.infoBox .info dd').last().offset().top - $('.infoBox .info dt').first().offset().top -20 + 'px') //设置说明文案左边的竖线的高度
    }
    $(document).ready(function () {
        if($('.editRoute').css('display') === 'none') {//防止display:none时chosen插件获取不到select的尺寸
            $('.editRoute').css({
                'visibility': 'hidden',
                'display': 'block'
            })
            $('select').not('.select-chosen,.ghostSelect').chosen({disable_search: true})
            $('.editRoute').css({
                'visibility': 'visiable',
                'display': 'none'
            })
        }else {
            $('select').not('.select-chosen,.ghostSelect').chosen({disable_search: true})
        }
        showRoomOrHouse($('#rentalType .property_type.selected').data('id'))
        initInfoHeight()
        $('#fileuploader').uploadFile({
            url: '/api/1/upload_image',
            fileName: 'data',
            formData: {watermark: true},
            //showProgress: true,
            showPreview: true,
            showDelete: true,
            showDone: false,
            previewWidth: '100%',
            previewHeight: '100%',
            showQueueDiv: 'uploadProgress',
            statusBarWidth: '140px',
            maxFileCount: 12, //最多上传12张图片
            maxFileSize: 1024 * 1024, //允许单张图片文件的最大占用空间,暂时设为1M
            uploadFolder: '',
            allowedTypes: 'jpg,jpeg,png,gif',
            acceptFiles: 'image/',
            allowDuplicates: false,
            multiDragErrorStr: window.i18n('不允许同时拖拽多个文件上传.'),
            extErrorStr: window.i18n('不允许上传. 允许的文件扩展名: '),
            duplicateErrorStr: window.i18n('不允许上传. 文件已存在.'),
            sizeErrorStr: window.i18n('不允许上传. 允许的最大尺寸为: '),
            uploadErrorStr: window.i18n('不允许上传'),
            maxFileCountErrorStr: window.i18n(' 不允许上传. 上传最大文件数为:'),
            deleteCallback: function(data, pd){
                var url
                if($.isArray(data)){
                    url = data[0]
                }else{
                    url = data.val.url
                }
                var index = imageArr.indexOf(url)
                if(index >= 0){
                    imageArr.splice(index, 1)
                }
            },
            onSuccess:function(files, data, xhr, pd){
                if(typeof data === 'string') { //This will happen in IE
                    try {
                        data = JSON.parse(data.match(/<pre>((.|\n)+)<\/pre>/m)[1])
                    } catch(e){
                        throw('Unexpected response data of uploading file!')
                    }
                }
                imageArr.push(data.val.url)
                pd.progressDiv.hide()
            },
            onLoad:function(obj) {
                $.each(imageArr, function(i, v){
                    obj.createProgress(v)
                    $('#uploadProgress').find('.ajax-file-upload-statusbar').eq(i).find('.ajax-file-upload-progress').hide()
                })
            },
        })
    })
})()