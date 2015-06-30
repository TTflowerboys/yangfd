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

    function initSelect(selector) {
        $(selector + ' div').click(function () {
            var text = $(this).text()
            $.each($(selector + ' div'), function (i, val) {
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
        if($(selector + ' .selected').length === 0) {
            $(selector + ' div').eq(0).addClass('selected')
        }
    }
    initSelect('#propertyType')
    if(!$('#landlordType').val()) {
        $('#landlordType').find('option[data-slug=live_out_landlord]').prop('selected', 'selected').end().trigger('chosen:updated')
    }
    if(!$('#unit option[selected]').length && window.currency) {
        $('#unit').find('option[value=' + window.currency + ']').prop('selected', 'selected').end().trigger('chosen:updated')
    } else if(!$('#unit option[selected]').length) {
        $('#unit').find('option').eq(0).prop('selected', 'selected').end().trigger('chosen:updated')
    }
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
    function showRoomOrHouse(index){
        if(index === 0){
            $('[data-show=singleRoom]').show().siblings().hide()
        }else if(index === 1){
            $('[data-show=entireHouse]').show().siblings().hide()
        }
    }

    $('#rentalType div').click(function () {
        var index = $(this).index()
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
        $('#rentalType').trigger('change')
        showRoomOrHouse(index)
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
        var $btn = $(this)
        function showPostcodeNoResultMsg () {
            $btn.siblings('.postcodeNoResultMsg').show()
        }
        function hidePostcodeNoResultMsg () {
            $btn.siblings('.postcodeNoResultMsg').hide()
        }
        hidePostcodeNoResultMsg()
        var postcodeIndex = $('#postcode').val().replace(/\s/g, '').toUpperCase()
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
            $('#latitude').val(val.latitude)
            $('#longitude').val(val.longitude)
            var geocodeApiUrl = 'https://maps.googleapis.com/maps/api/geocode/json?latlng=' + $('#latitude').val() + ',' + $('#longitude').val() + '&result_type=street_address&key=AIzaSyCXOb8EoLnYOCsxIFRV-7kTIFsX32cYpYU'
            geonamesApi.getCityByLocation(val.country, val.latitude, val.longitude, function (val) {
                $.betterGet('/reverse_proxy?link=' + encodeURIComponent(geocodeApiUrl))
                    .done(function (data) {
                        data = JSON.parse(data)
                        var streetArr = [],
                            filter = ['street_number', 'route', 'neighborhood']
                        if(data && data.results && data.results.length > 0 && data.results[0] && data.results[0].address_components) {
                            _.each(data.results[0].address_components, function (v, i) {
                                if(_.intersection(filter, v.types).length > 0) {
                                    streetArr.push(v.short_name)
                                }
                            })
                        }
                        $('#street').val(streetArr.join(','))
                        $('.buttonLoading').trigger('end')
                        $btn.prop('disabled', false).text(window.i18n('重新获取'))
                        $('#address').show()
                    }).fail(function () {
                        $('.buttonLoading').trigger('end')
                        $btn.prop('disabled', false).text(window.i18n('重新获取'))
                    })
                $('#city-select').html(
                    _.reduce(val, function(pre, val, key) {
                        return pre + '<option value="' + val.id + '"' + (key === 0 ? 'selected' : '') + '>' + val.name + (val.country === 'US' ? ' (' + val.admin1 + ')' : '') + '</option>' //美国的城市有很多重名，要在后面加上州名缩写
                    }, '<option value="">' + i18n('请选择城市') + '</option>')
                ).trigger('chosen:updated').trigger('change')
            }, function () {
                $('.buttonLoading').trigger('end')
                $btn.prop('disabled', false).text(window.i18n('重新获取'))
            })

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
                            showPostcodeNoResultMsg()
                            $('.buttonLoading').trigger('end')
                            $btn.prop('disabled', false).text(window.i18n('重新获取'))
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
        var includePhoneReg = /(?:(?:\+?1\s*(?:[.-]\s*)?)?(?:\(\s*([2-9]1[02-9]|[2-9][02-8]1|[2-9][02-8][02-9])\s*\)|([2-9]1[02-9]|[2-9][02-8]1|[2-9][02-8][02-9]))\s*(?:[.-]\s*)?)?([2-9]1[02-9]|[2-9][02-9]1|[2-9][02-9]{2})\s*(?:[.-]\s*)?([0-9]{4})(?:\s*(?:#|x\.?|ext\.?|extension)\s*(\d+))?/
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
        if(includePhoneReg.test($('#description').val())) {
            validate = false
            errorMsg = i18n('平台将提供房东联系方式选择，请勿在此填写任何形式的联系方式，违规发布将会予以处理')
            highlightErrorElem($('#description'))
        }

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
    function updateTitle() {
        var defaultTitle = ($('#community').val() || $('#region').val() || $('#street').val()) + ' ' + $('#bedroom_count').children('option:selected').val() + window.i18n('居室') + $('#rentalType .selected').text().trim() + window.i18n('出租')
        $('#title').attr('placeholder', defaultTitle)
    }
    updateTitle()
    $('#title').on('focus', function () {
        if(!$(this).val()) {
            $(this).val($(this).attr('placeholder'))
        }
    }).on('blur', function () {
        if($(this).val() === $(this).attr('placeholder')) {
            $(this).val('')
        }
    })
    $('[data-trigger=updateTitle]').on('change', function () {
        updateTitle()
    })
    function wrapData(data) {
        var o = {}
        var lang = window.lang || 'zh_Hans_CN'
        o[lang] = data
        return JSON.stringify(o)
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
            'name': wrapData(address),
            'property_type': $('#propertyType .selected').data('id'),
            'country': $('#country').val(), //todo
            'city': $('#city').val(), //todo
            'street': wrapData($('#street').val()), //todo
            'address': wrapData(address),
            'highlight': wrapData([]), //todo?
            'reality_images': wrapData(imageArr),
            'region_highlight': JSON.stringify(regionHighlight),
            'kitchen_count': $('#kitchen_count').children('option:selected').val(),
            'bathroom_count': $('#bathroom_count').children('option:selected').val(),
            'bedroom_count': $('#bedroom_count').children('option:selected').val(),
            'living_room_count': $('#living_room_count').children('option:selected').val(),
            'indoor_facility': JSON.stringify(indoorFacility),
            'community_facility': JSON.stringify(communityFacility),
            'real_address': wrapData(address),
            'description': wrapData($('#description').val()),
            'zipcode': $('#postcode').val().trim().toUpperCase(),
            'user_generated': true
        })
        if($('#community').val() !== ''){
            propertyData.community = wrapData($('#community').val())
        }
        if($('#floor').val() !== ''){
            propertyData.floor = wrapData($('#floor').val())
        }
        if($('#house_name').val() !== ''){
            propertyData.house_name = wrapData($('#house_name').val())
        }
        if($('#rentalType .selected').index() === 1 && getSpace() !== false){
            propertyData.space = getSpace()
        }
        if($('#latitude').val() !== '') {
            propertyData.latitude = $('#latitude').val()
        }
        if($('#longitude').val() !== '') {
            propertyData.longitude = $('#longitude').val()
        }
        if($('.ajax-file-upload-statusbar.cover').length) {
            propertyData.cover = wrapData($('.ajax-file-upload-statusbar.cover').attr('data-url'))
        } else {
            delete propertyData.cover
        }
        return propertyData
    }

    //获取出租单模型数据
    function getTicketData(options){
        var title = $('#title').val() || $('#title').attr('placeholder') //如果用户没有填写title，默认为街区+居室+出租类型，比如“Isle of Dogs三居室单间出租”
        var ticketData = $.extend(options,{
            'landlord_type': $('#landlordType').val(), //房东类型
            'rent_type': $('#rentalType .selected')[0].getAttribute('data-id'), //出租类型
            'deposit_type': $('#deposit_type').children('option:selected').val(), //押金方式
            'price': JSON.stringify({'unit': $('#unit').children('option:selected').val(), 'value': $('#price')[0].value }), //出租价格
            'bill_covered': $('#billCovered').is(':checked'), //是否包物业水电费
            'rent_available_time': new Date($('#rentPeriodStartDate').val()).getTime() / 1000, //出租开始时间
            'title': title,
        })
        if($('#description').val() !== ''){
            ticketData.description = $('#description').val()
        }
        if(getSpace() !== false) {
            ticketData.space = getSpace() //面积
        }
        if($('#rentPeriodEndDate').val()){
            ticketData.rent_deadline_time = new Date($('#rentPeriodEndDate').val()).getTime() / 1000
        }
        if($('#minimumRentPeriod').val()) {
            ticketData.minimum_rent_period = JSON.stringify({unit: $('#minimumRentPeriod').val().split(',')[1], value: $('#minimumRentPeriod').val().split(',')[0]})
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
                        $('.buttonLoading').trigger('end')
                        $btn.prop('disabled', false).text(window.i18n('预览并发布'))

                        //
                        ga('send', 'event', 'property_to_rent_create', 'time-consuming', 'first-step', (new Date() - createStartTime)/1000)
                    })
                    .fail(function (ret) {
                        $('.buttonLoading').trigger('end')
                        $errorMsg.html(window.getErrorMessageFromErrorCode(ret)).show()
                        $btn.prop('disabled', false).text(window.i18n('预览并发布'))
                    })
            }).fail(function (ret) {
                $('.buttonLoading').trigger('end')
                $errorMsg.html(window.getErrorMessageFromErrorCode(ret)).show()
                $btn.prop('disabled', false).text(window.i18n('预览并发布'))
            })
        return false
    })

    //startDate
    if($('#rentPeriodStartDate').val() === ''){
        $('#rentPeriodStartDate').val($.format.date(new Date(), 'yyyy-MM-dd'))
    }
    $('.date>input').each(function (index, elem) {
        $(elem).parent('.date').dateRangePicker({
            autoClose: true,
            singleDate: true,
            showShortcuts: false
        })
        .bind('datepicker-change', function (event, obj) {
            $(elem).val($.format.date(new Date(obj.date1), 'yyyy-MM-dd'))
        })
    })


    $('#load_more .load_more').click(function () {
        $('#load_more').hide()
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
    function getPrivateContactMethods () {
        return _.map(_.filter($('[data-addContact]'), function (elem) {
            return $(elem).is('[type=checkbox]') ? !$(elem).is(':checked') : !$(elem).val()
        }), function (elem) {
            return $(elem).attr('data-addContact')
        })
    }
    var needSMSCode
    $requestSMSCodeBtn.on('click', function (e) {
        $errorMsgOfGetCode.empty().hide()
        var $btn = $(this)
        // Check email and phone
        var valid = $.validate($('#form2'), {
            onError: function (dom, validator, index) {
                $errorMsgOfGetCode.html(window.getErrorMessage(dom.name, validator)).show()
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
            params.private_contact_methods = JSON.stringify(getPrivateContactMethods())
            $.betterPost('/api/1/user/fast-register', params)
                .done(function (val) {
                    window.user = val
                    //$('.leftWrap').addClass('hasLogin').find('form').remove()
                    //ga('send', 'event', 'signup', 'result', 'signup-success')
                    // Count down 1 min to enable resend
                    $btn.prop('disabled', true)
                    var timer = setTimeout(function () {
                        $btn.prop('disabled', true)
                    }, 60000)
                    $.betterPost('/api/1/user/sms_verification/send', {
                        country: $('#countryPhone').val() || $('#countryPhone option').eq(0).val(),
                        phone: $('[name=phone]').val()
                    }).done(function () {
                        needSMSCode = true
                        $btn.siblings('.sucMsg').show()
                    }).fail(function (ret) {
                        clearTimeout(timer)
                        $errorMsgOfGetCode.html(window.getErrorMessageFromErrorCode(ret)).show()
                        $btn.text(window.i18n('重新获取验证码')).prop('disabled', false)
                    })
                })
                .fail(function (ret) {
                    $errorMsgOfGetCode.html(window.getErrorMessageFromErrorCode(ret)).show()
                    $btn.text(window.i18n('重新获取验证码')).prop('disabled', false)
                })
        }
    })

    $('#publish').on('click', function(e) {
        $errorMsg2.empty().hide()
        var $btn = $(this)
        function publishRentTicket (){
            function publish() {
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
            var privateContactMethods = getPrivateContactMethods()
            if(privateContactMethods.length === 3) {
                $errorMsg2.html(i18n('请至少展示一种联系方式给租客')).show()
                $btn.text(window.i18n('重新发布')).prop('disabled', false)
                return
            }
            var params = {private_contact_methods: JSON.stringify(privateContactMethods)}
            if($('#wechat').val()) {
                params.wechat = $('#wechat').val()
            }
            $.betterPost('/api/1/user/edit', params)
                .done(function () {
                    publish()
                }).fail(function (ret) {
                    $errorMsg2.html(window.getErrorMessageFromErrorCode(ret)).show()
                    $btn.text(window.i18n('重新发布')).prop('disabled', false)
                })
        }

        if(window.user){
            if(!needSMSCode) {
                publishRentTicket()
            } else if($('#code').val()) {
                //todo 验证验证码
                $.betterPost('/api/1/user/' + window.user.id + '/sms_verification/verify', {
                    code: $('#code').val()
                }).done(function () {
                    publishRentTicket()
                }).fail(function (ret) {
                    $errorMsg2.html(window.getErrorMessageFromErrorCode(ret)).show()
                    $btn.text(window.i18n('重新发布')).prop('disabled', false)
                })

            } else {
                $errorMsg2.text(i18n('请填写您收到的短信验证码后再发布房产')).show()
            }
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
        $('.route').each(function (index, elem) {
            if($(elem).css('display') === 'none') {//防止display:none时chosen插件获取不到select的尺寸
                $(elem).css({
                    'visibility': 'hidden',
                    'display': 'block'
                })
                $(elem).find('select').not('.select-chosen,.ghostSelect').chosen({disable_search: true})
                $(elem).css({
                    'visibility': 'visiable',
                    'display': 'none'
                })
            }else {
                $(elem).find('select').not('.select-chosen,.ghostSelect').chosen({disable_search: true})
            }
        })

        showRoomOrHouse($('#rentalType .property_type.selected').index())
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
            maxFileSize: 2 * 1024 * 1024, //允许单张图片文件的最大占用空间为2M
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
            abortStr: window.i18n('停止'),
            cancelStr: window.i18n('取消'),
            deletelStr: window.i18n('删除'),
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
                if(data.ret) {
                    pd.progressDiv.hide().parent('.ajax-file-upload-statusbar').remove()
                    return alert(window.i18n('上传错误：错误代码') + '(' + data.ret + '),' + data.debug_msg)
                }
                imageArr.push(data.val.url)
                pd.progressDiv.hide().parent('.ajax-file-upload-statusbar').attr('data-url', data.val.url)
            },
            onLoad:function(obj) {
                $.each(imageArr, function(i, v){
                    var cover = $('.image_panel').attr('data-cover')
                    obj.createProgress(v)
                    var previewElem = $('#uploadProgress').find('.ajax-file-upload-statusbar').eq(i)
                    previewElem.attr('data-url', v).find('.ajax-file-upload-progress').hide()
                    if(previewElem.attr('data-url') === cover) {
                        previewElem.addClass('cover')
                    }
                })
            },
            onSubmit: function () {
                if(!$('.ajax-file-upload-statusbar.cover').length) {
                    $('.ajax-file-upload-statusbar').eq(0).addClass('cover')
                }
            }
        })
        $('.image_panel').delegate('.ajax-file-upload-statusbar', 'click', function () {
            $(this).toggleClass('cover').siblings('.ajax-file-upload-statusbar').removeClass('cover')
        })
    })
})()