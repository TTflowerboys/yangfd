(function () {
    var itemsPerPage = 5
    var lastItemTime
    var isLoading = false
    var isAllItemsLoaded = false
    var mode = window.team.getQuery('mode', window.location.href)?  window.team.getQuery('mode', window.location.href): 'list'

    // Init all filter options
    window.countryData = getData('countryData')
    window.cityData = getData('cityData')
    window.propertyCountryData = getData('propertyCountryData')
    window.propertyCityData = getData('propertyCityData')
    window.rentTypeData = getData('rentTypeData')
    window.rentBudgetData = getData('rentBudgetData')
    window.propertyTypeData = getData('propertyTypeData')
    window.rentPeriodData = getData('rentPeriodData')
    window.bedroomCountData = getData('bedroomCountData')
    window.spaceData = getData('spaceData')
    //used in mobile client
    function filterObjectProperty (rent) {
        var obj = _.clone(rent)
        var arr = ['community', 'floor', 'house_name']
        _.each(arr, function(val) {
            if(typeof obj.property[val] === 'object') {
                delete obj.property[val]
            }
        })
        return obj
    }
    var currantDropLoad = $('body').dropload({ //下拉刷新
        domUp : {
            domClass   : 'dropload-up',
            domRefresh : '<div class="dropload-refresh">↓ ' + i18n('下拉刷新') + '</div>',
            domUpdate  : '<div class="dropload-update">↑ ' + i18n('松开刷新') + '</div>',
            domLoad    : '<div class="dropload-load"><span class="loading"></span>' + i18n('加载中...') + '</div>'
        },

        loadUpFn : function(me){

            if(isLoading){
                return me.resetload();
            }
            if(!checkValidOfRequestParams()) {
                return me.resetload();
            }
            var params = window.getBaseRequestParams()
            params.per_page = itemsPerPage

            isLoading = true
            var totalResultCount = 0
            $.betterPost('/api/1/rent_ticket/search', params)
                .done(function (val) {
                    var array = val
                    var resultHtml = ''
                    if (!_.isEmpty(array)) {
                        lastItemTime = _.last(array).last_modified_time
                        window.rentList = array
                        _.each(array, function (rent) {
                            if(rent && rent.property){
                                rent = filterObjectProperty(rent)
                                var houseResult = _.template($('#rentCard_template').html())({rent: rent})
                                resultHtml += houseResult

                                if (lastItemTime > rent.last_modified_time) {
                                    lastItemTime = rent.last_modified_time
                                }
                            }
                        })
                        $('#result_list').html(resultHtml)
                        totalResultCount = getCurrentTotalCount()
                        isAllItemsLoaded = totalResultCount < itemsPerPage
                    }else {
                        isAllItemsLoaded = true
                    }
                    /*if(isAllItemsLoaded){
                        $('.isAllLoadedInfo').show()
                    }*/
                    $('.dropload-load').html(i18n('加载成功'))
                    setTimeout(function () {
                        me.resetload()
                    },500)

                }).fail(function () {
                    $('.dropload-load').html(i18n('加载失败'))
                    setTimeout(function () {
                        me.resetload()
                    },500)
                }).always(function () {
                    updateResultCount(totalResultCount)
                    isLoading = false
                    if (!window.team.isCurrantClient()) {
                        window.updateTabSelectorVisibility(true)
                    }
                })
        },
        domDown: {}

    });
    window.$currantDropLoad = $(currantDropLoad)
    function fnTransition(dom,num){
        dom.css({
            '-webkit-transition':'all '+num+'ms',
            'transition':'all '+num+'ms'
        });
    }
    window.$currantDropLoad.on('loading', function () {
        if(isLoading) {
            return
        }
        var me = currantDropLoad
        if(!me.insertDOM){
            me.$element.prepend('<div class="'+me.opts.domUp.domClass+'"></div>');
            me.insertDOM = true;
        }
        me._offsetY = 50
        me.$domResult = me.$domUp = $('.'+me.opts.domUp.domClass);

        me.$domUp.html('').append(me.opts.domUp.domLoad);
        me.opts.loadUpFn(me)

        fnTransition(me.$domUp,300);
        $('body,html').animate({scrollTop: 0}, 300, function() {
            me.$domUp.css({'height': me._offsetY});
        })
    })

    function checkValidOfRequestParams () {
        var rentBudgetMin = $('[name=rentBudgetMin]').val()
        var rentBudgetMax = $('[name=rentBudgetMax]').val()
        var rentPeriodStartDate = $('#rentPeriodStartDate').val()
        var rentPeriodEndDate = $('#rentPeriodEndDate').val()
        if (rentBudgetMin.length && rentBudgetMax.length && parseInt(rentBudgetMin) >= parseInt(rentBudgetMax)) {
            window.dhtmlx.message({ type:'error', text: i18n('租金下限必须小于租金上限')});
            return false
        }
        if (rentPeriodStartDate.length && rentPeriodEndDate.length && window.moment(rentPeriodStartDate) >= window.moment(rentPeriodEndDate)) {
            window.dhtmlx.message({ type:'error', text: i18n('租期开始日期必须早于租期结束日期')});
            return false
        }
        return true

    }
    window.getBaseRequestParams = function () {
        var params = {}
        var country = $('select[name=propertyCountry]').children('option:selected').val()
        if (country) {
            params.country = country
        }
        var city = $('select[name=propertyCity]').children('option:selected').val()
        if (city) {
            params.city = city
        }
        var propertyType = window.team.isPhone() ? getSelectedTagFilterDataId('#propertyTypeTag') : $('select[name=propertyType]').children('option:selected').val()
        if (propertyType) {
            params.property_type = propertyType
        }
        var rentType = window.team.isPhone() ? getSelectedTagFilterDataId('#rentTypeTag') : $('select[name=rentType]').children('option:selected').val()
        if (rentType) {
            params.rent_type = rentType
        }

        var rentBudgetType = getRentBudget()
        if (rentBudgetType.length) {
            params.rent_budget = rentBudgetType
        }

        var rentPeriod = getSelectedTagFilterDataId('#rentPeriodTag')
        if (rentPeriod) {
            params.rent_period = rentPeriod
        }
        var bedroomCount = getSelectedTagFilterDataId('#bedroomCountTag')
        if (bedroomCount) {
            params.bedroom_count = bedroomCount
        }
        var space = getSelectedTagFilterDataId('#spaceTag')
        if (space) {
            params.space = space
        }

        var rentAvailableTime
        if($('[name=rentPeriodStartDate]').val()) {
            rentAvailableTime = new Date($('#rentPeriodStartDate').val()).getTime() / 1000
            if(rentAvailableTime) {
                params.rent_available_time = rentAvailableTime
            }
        }

        var rentDeadlineTime
        if($('[name=rentPeriodEndDate]').val()) {
            rentDeadlineTime = new Date($('#rentPeriodEndDate').val()).getTime() / 1000
            if(rentDeadlineTime) {
                params.rent_deadline_time = rentDeadlineTime
            }
        }
        params = _.extend(params, filterOfNeighborhoodSubwaySchool.getParam())
        return params;
    }

     //used in mobile client
    window.getSummaryTitle = function () {
        function getSelectedTagValueWithTagName(tagName) {
            var $selectedChild = $('#tags #' + tagName).children('.selected')
            if ($selectedChild.length) {
                return $selectedChild.first().text()
            }
            return ''
        }

        var selectedCountry = $('select[name=propertyCountry]').children('option:selected').text()
        var selectedCity = $('select[name=propertyCity]').children('option:selected').text()
        var selectedRentType = getSelectedTagValueWithTagName('rentTypeTag')
        var selectedPropertyType = getSelectedTagValueWithTagName('propertyTypeTag')
        var selectedRentalBudget = getSelectedTagValueWithTagName('rentalBudgetTag')
        var selectedRentPeriod = getSelectedTagValueWithTagName('rentPeriodTag')
        var selectedBedroomCount = getSelectedTagValueWithTagName('bedroomCountTag')
        var selectedSpaceCount = getSelectedTagValueWithTagName('spaceTag')

        //TODO get rent start date

        var description = ''
        function add (item) {
            if (item && item.length > 0) {
                if (description.length > 0) {
                    description = description + ', ' + item;
                }
                else {
                    description = item;
                }
            }
        }

        add(selectedCountry)
        add(selectedCity)
        add(selectedRentType)
        add(selectedPropertyType)
        add(selectedRentalBudget)
        add(selectedRentPeriod)
        add(selectedBedroomCount)
        add(selectedSpaceCount)
        return description
    }


    //Filter Setup
    window.currantModule.setupFiltersFromURL(location.href)
    window.currantModule.bindFiltersToChosenControls()

    var filterOfNeighborhoodSubwaySchool = new window.currantModule.InitFilterOfNeighborhoodSubwaySchool({
        citySelect: $('[name=propertyCity]'),
        countrySelect: $('[name=propertyCountry]')
    })
    filterOfNeighborhoodSubwaySchool.Event.bind('change', function () {
        //console.log('change:')
        //console.log(filterOfNeighborhoodSubwaySchool.getParam())
        loadRentListByView()
        var params = filterOfNeighborhoodSubwaySchool.getUrlParam()
        _.each(params, function (val, key) {
            updateURLQuery(key, val)
        })
    })


    //Tag setup
    window.currantModule.setupTagsFromURL(location.href)

    //check showTags at first time in mobile
    if (window.team.isPhone()) {
        var tagQueries = ['property_type', 'rent_type', 'rent_budget', 'rent_period', 'bedroom_count', 'space']
        var tagQuery = _.find(tagQueries, function(key){ return window.team.getQuery(key, location.href) !== ''})
        if (tagQuery) {
            showTagsOnMobile()
        }
    }

    function getData(key) {
        return JSON.parse(document.getElementById(key).innerHTML)
    }

    // Update List/Map tab visibility
    window.updateTabSelectorVisibility = function (visible) {
        var tabSelectorKey = '.tabSelector'
        if (window.team.isPhone()) {
            tabSelectorKey += '_phone'
        }

        if (visible) {
            $(tabSelectorKey).show()
        }
        else {
            $(tabSelectorKey).hide()
        }
    }

    function getCurrentTotalCount() {
        return $('#result_list').children('.rentCard').length
    }



    function loadRentList(reload) {
        if(!checkValidOfRequestParams()) {
            return
        }
        if (window.betterAjaxXhr && window.betterAjaxXhr['/api/1/rent_ticket/search'] && window.betterAjaxXhr['/api/1/rent_ticket/search'].readyState !== 4) {
            window.betterAjaxXhr['/api/1/rent_ticket/search'].abort()
        }
        var params = window.getBaseRequestParams()
        params.per_page = itemsPerPage
        $('.isAllLoadedInfo').hide()
        if (lastItemTime) {
            params.last_modified_time = lastItemTime
            //Load more triggered
            ga('send', 'event', 'rent_list', 'trigger', 'load-more')
        }

        if(reload){
            $('#result_list').empty()
            lastItemTime = null
            delete params.last_modified_time
        }
        $('#result_list_container').show()
        $('.emptyPlaceHolder').hide();

        if(!team.isPhone()){
            $('#number_container').text(window.i18n('加载中'))
            $('#number_container').show()
        }
        isLoading = true
        $('#loadIndicator').show()
        var totalResultCount = getCurrentTotalCount()
        if($('body').height() - $(window).scrollTop() - $(window).height() < 120 && totalResultCount > 0) {
            $('body,html').animate({scrollTop: $('body').height()}, 300)
        }

        $.betterPost('/api/1/rent_ticket/search', params)
            .done(function (val) {
                var array = val
                if (!_.isEmpty(array)) {
                    lastItemTime = _.last(array).last_modified_time

                    if (!window.rentList) {
                        window.rentList = []
                    }
                    window.rentList = window.rentList.concat(array)

                    _.each(array, function (rent) {
                        rent = filterObjectProperty(rent)
                        var houseResult = _.template($('#rentCard_template').html())({rent: rent})
                        $('#result_list').append(houseResult)

                        if (lastItemTime > rent.last_modified_time) {
                            lastItemTime = rent.last_modified_time
                        }
                    })
                    totalResultCount = getCurrentTotalCount()

                    isAllItemsLoaded = false
                } else {
                    isAllItemsLoaded = true
                    //$('.isAllLoadedInfo').show()
                }
                updateResultCount(totalResultCount)

            }).fail(function (ret) {
                if(ret !== 0) {
                    updateResultCount(totalResultCount)
                }
        }).always(function () {
                $('#loadIndicator').hide()
                isLoading = false
                if (!window.team.isCurrantClient()) {
                    window.updateTabSelectorVisibility(true)
                }
            })
    }

    function updateResultCount(count) {
        var $numberContainer = $('#number_container')
        if (count) {
            //$number.text(count)

            if(!team.isPhone()){
                $numberContainer.text(window.i18n('共找到下列出租房'))
                $numberContainer.show()
            }
            $('#result_list_container').show()
            $('.emptyPlaceHolder').hide();
        } else {
            //$number.text(count)
            $('#result_list_container').hide()
            $('.emptyPlaceHolder').show();
            ga('send', 'event', 'rent_list', 'result', 'empty-result',
               $('.emptyPlaceHolder').find('textarea[name=description]').text())
        }
    }

    function loadRentListByView() {
        if(mode === 'list'){
            lastItemTime = null
            loadRentList(true)
        }else if(mode === 'map'){
            if (typeof Microsoft === 'undefined'){
                var scriptString = '<script src="http://ecn.dev.virtualearth.net/mapcontrol/mapcontrol.ashx?v=7.0&onscriptload=onBingMapScriptLoad"></script>'
                window.onBingMapScriptLoad = function () {
                    if (typeof Microsoft === 'undefined') {
                        window.alert(window.i18n('地图加载失败'))
                    }else{
                        loadRentMapList()
                    }
                }
                $('body').append(scriptString)
            }else{
                loadRentMapList()
            }
        }
    }

    function updateURLQuery(key, value) {
        var newUrl = window.team.setQuery(key, value, location.href)
        history.pushState({}, null, newUrl)
    }

    /*
     * All Interactions with top filters
     *
     * */
    var $countrySelect = $('select[name=propertyCountry]')
    $countrySelect.change(function () {
        var countryCode = $('select[name=propertyCountry]').children('option:selected').val()

        ga('send', 'event', 'rent_list', 'change', 'select-country',
            $('select[name=propertyCountry]').children('option:selected').text())
        if(countryCode) {
            window.currantModule.updateCityByCountry(countryCode, $('select[name=propertyCity]'))
        } else {
            window.currantModule.clearCity($('select[name=propertyCity]'))
        }
        loadRentListByView()
        updateURLQuery('country', countryCode)
    })

    var $citySelect = $('select[name=propertyCity]')
    $citySelect.change(function () {

        var cityId = $('select[name=propertyCity]').children('option:selected').val()
        ga('send', 'event', 'rent_list', 'change', 'select-city',
            $('select[name=propertyCity]').children('option:selected').text())
        loadRentListByView()
        updateURLQuery('city', cityId)
    })

    var $propertyTypeSelect = $('select[name=propertyType]')
    $propertyTypeSelect.change(function () {

        var propertyTypeId = $('select[name=propertyType]').children('option:selected').val()
        ga('send', 'event', 'rent_list', 'change', 'select-proprty-type',
            $('select[name=propertyType]').children('option:selected').text())
        loadRentListByView()
        updateURLQuery('property_type', propertyTypeId)
    })

    var $rentTypeSelect = $('select[name=rentType]')
    $rentTypeSelect.change(function () {

        var rentTypeId = $('select[name=rentType]').children('option:selected').val()
        ga('send', 'event', 'rent_list', 'change', 'select-rent-type',
            $('select[name=rentType]').children('option:selected').text())
        loadRentListByView()
        updateURLQuery('rent_type', rentTypeId)
    })

    function getSelectedTagFilterDataId(tag) {
        var $selectedChild = $('#tags ' + tag).children('.selected')
        if ($selectedChild.length) {
            return $selectedChild.first().attr('data-id')
        }
        return ''
    }
    function getRentBudget() {
        var min = $('[name=rentBudgetMin]').val()
        var max = $('[name=rentBudgetMax]').val()
        if (!min.length && !max.length) {
            return ''
        }
        if (min.length && max.length && parseInt(min) >= parseInt(max)) {
            window.dhtmlx.message({ type:'error', text: i18n('租金下限必须小于租金上限')});
            return ''
        }
        return 'rent_budget:' + min.split(':')[0] + ',' + max.split(':')[0] + ',' + window.currency
    }
    $('#tags #propertyTypeTag').on('click', '.toggleTag', function (event) {
        event.stopPropagation()

        var $item = $(event.target)
        var alreadySelected = $item.hasClass('selected')
        var $parent = $(event.target.parentNode)
        $parent.find('.toggleTag').removeClass('selected')

        if (!alreadySelected) {
            $item.addClass('selected')
        }

        ga('send', 'event', 'rent_list', 'change', 'change-property-type', $item.text())
        loadRentListByView()
    })

    $('#tags #rentTypeTag').on('click', '.toggleTag', function (event) {
        event.stopPropagation()

        var $item = $(event.target)
        var alreadySelected = $item.hasClass('selected')
        var $parent = $(event.target.parentNode)
        $parent.find('.toggleTag').removeClass('selected')

        if (!alreadySelected) {
            $item.addClass('selected')
        }

        ga('send', 'event', 'rent_list', 'change', 'change-rent-type', $item.text())
        loadRentListByView()
    })


    $('#tags #rentPeriodTag').on('click', '.toggleTag', function (event) {
        event.stopPropagation()

        var $item = $(event.target)
        var alreadySelected = $item.hasClass('selected')
        var $parent = $(event.target.parentNode)
        $parent.find('.toggleTag').removeClass('selected')

        if (!alreadySelected) {
            $item.addClass('selected')
        }

        ga('send', 'event', 'rent_list', 'change', 'change-rent-period', $item.text())
        loadRentListByView()
    })

    $('#tags #bedroomCountTag').on('click', '.toggleTag', function (event) {
        event.stopPropagation()

        var $item = $(event.target)
        var alreadySelected = $item.hasClass('selected')
        var $parent = $(event.target.parentNode)
        $parent.find('.toggleTag').removeClass('selected')

        if (!alreadySelected) {
            $item.addClass('selected')
        }

        ga('send', 'event', 'rent_list', 'change', 'change-bedroomCount', $item.text())
        loadRentListByView()
    })

    $('#tags #spaceTag').on('click', '.toggleTag', function (event) {
        event.stopPropagation()

        var $item = $(event.target)
        var alreadySelected = $item.hasClass('selected')
        var $parent = $(event.target.parentNode)
        $parent.find('.toggleTag').removeClass('selected')

        if (!alreadySelected) {
            $item.addClass('selected')
        }

        ga('send', 'event', 'rent_list', 'change', 'change-space', $item.text())
        loadRentListByView()
    })

    var $dateInput = $('.date input')
    function resetDateInputType () {
        if(window.team.isPhone()) {
            $dateInput.each(function () {
                $(this).get(0).type = 'date'
            })
        }else{
            $dateInput.each(function () {
                $(this).get(0).type = 'text'
            })
        }
    }
    resetDateInputType()
    $(window).resize(resetDateInputType)
    //$rentPeriodStartDate.attr('placeholder',$.format.date(new Date(), 'yyyy-MM-dd'))
    //$('#rentPeriodStartDate').attr('value', window.moment.utc(new Date()).format('YYYY-MM-DD'))
    $dateInput.each(function (index, elem) {
        $(elem).dateRangePicker({
            //startDate: new Date(new Date().getTime() + 3600 * 24 * 30 * 1000),
            autoClose: true,
            singleDate: true,
            showShortcuts: false,
            lookBehind: false,
            getValue: function() {
                //return this.value || $.format.date(new Date(), 'yyyy-MM-dd');
            }
        })
            .bind('datepicker-change', function (event, obj) {
                $(elem).val($.format.date(new Date(obj.date1), 'yyyy-MM-dd')).trigger('change')

            })
            .bind('change', function () {
                var val = $(this).val()
                if(val !== '') {
                    $(this).siblings('.clear').show()
                } else{
                    $(this).siblings('.clear').hide()
                }
                ga('send', 'event', 'rent_list', 'change', 'change-space', val)
            })
    })
    //$('#rentPeriodStartDate').trigger('change')
    
    $('.calendar .clear').bind('click', function(event){
        $(this).siblings('input').val('').trigger('change').attr('placeholder', i18n('请选择日期'))
    })
    $('.confirmFilter').click(function () {

        loadRentListByView()
    })
    $('[data-filter]').change(function () {
        loadRentListByView()
    })
    // Show or Hide tag filters on mobile
    function showTagsOnMobile() {
        var $button = $('#showTags')
        var $tags = $('#tags .tags_inner')
        if ($button.attr('data-state') === 'closed') {
            $tags.show()
            //http://css-tricks.com/snippets/jquery/animate-heightwidth-to-auto/
            $tags.animate({'max-height': 1000 + 'px'}, 400, 'swing') //make auto height
            $button.find('label').text(window.i18n('收起'))
            $button.find('img').addClass('rotated')
            $button.attr('data-state', 'open')
        }
    }

    function hideTagsOnMobile() {
        var $button = $('#showTags')
        var $tags = $('#tags .tags_inner')
        if ($button.attr('data-state') === 'open') {
            $tags.animate({'max-height': '0'}, 400, 'swing')
            $tags.slideUp(400)
            $button.find('label').text(window.i18n('更多选择'))
            $button.find('img').removeClass('rotated')
            $button.attr('data-state', 'closed')
        }
    }

    $('#tags #showTags').click(function (event) {
        var $button = $(event.delegateTarget)
        if ($button.attr('data-state') === 'closed') {
            showTagsOnMobile()
        }
        else {
            hideTagsOnMobile()
        }
    })

    function needLoad() {
        var scrollPos = $(window).scrollTop()
        var windowHeight = $(window).height()
        if (window.team.isCurrantClient()) { //如果是在App中，页头会被隐藏，需要补上一段距离
            windowHeight += 600
        }
        var listHeight = $('#result_list').height()
        var requireToScrollHeight = listHeight
        return windowHeight + scrollPos > requireToScrollHeight && !isLoading && !isAllItemsLoaded
    }

    function autoLoad() {
        if ($('[data-tab-name=list]').hasClass('selectedTab')) {
            if(needLoad()) {
                $('.isAllLoadedInfo').hide()
                loadRentList()
            }
        }
    }
    $(window).scroll(autoLoad)

    $(document).ready(function () {
        setTimeout(function () {
            var $tabContainer = $('[data-tabs]')
            var $tab = $tabContainer.find('[data-tab=' + mode + ']')
            if (!window.team.isPhone()) {
                $tab.parent().show()
                $tab.addClass('selectedTab')
                $tab.siblings().removeClass('selectedTab')
            }
            openTabContent(mode)
        }, 20)
    })

    $('[data-tabs]').tabs({trigger: 'click'}).on('openTab', function (event, target, tabName) {
        mode = tabName
        updateURLQuery('mode', mode)
        loadRentListByView()
    })


    function openTabContent(tabName) {
        var $tabContainer = $('[data-tabs]')
        var $tabContents = null

        $tabContents = $tabContainer.find('[data-tab-name=' + tabName + ']')
        $tabContents.addClass('selectedTab').show()
        $tabContents.siblings().removeClass('selectedTab').hide()
        $tabContainer.trigger('openTab', [$('.tabSelector [tab-name=' + tabName + ']'), tabName])
    }

    $('.tabSelector_phone').click(function (e) {
        var currentTab = $(this).attr('data-tab')
        if (currentTab === 'list'){
            mode = 'map'
            //to show map
            openTabContent(mode)
            $(this).attr('data-tab', mode)
        }
        else {
            mode = 'list'
            //to show list
            openTabContent(mode)
            $(this).attr('data-tab', mode)
        }
    })


    function loadRentMapList() {
        $('.emptyPlaceHolder').hide();
        if(!checkValidOfRequestParams()) {
            return
        }
        if (window.betterAjaxXhr && window.betterAjaxXhr['/api/1/rent_ticket/search'] && window.betterAjaxXhr['/api/1/rent_ticket/search'].readyState !== 4) {
            window.betterAjaxXhr['/api/1/rent_ticket/search'].abort()
        }
        var params = {'location_only': 1}
        var country = $('select[name=propertyCountry]').children('option:selected').val()
        if (country) {
            params.country = country
        }
        var city = $('select[name=propertyCity]').children('option:selected').val()
        if (city) {
            params.city = city
        }
        var propertyType = window.team.isPhone() ? getSelectedTagFilterDataId('#propertyTypeTag') : $('select[name=propertyType]').children('option:selected').val()
        if (propertyType) {
            params.property_type = propertyType
        }
        var rentType = window.team.isPhone() ? getSelectedTagFilterDataId('#rentTypeTag') : $('select[name=rentType]').children('option:selected').val()
        if (rentType) {
            params.rent_type = rentType
        }

        var rentBudgetType = getRentBudget()
        if (rentBudgetType.length) {
            params.rent_budget = rentBudgetType
        }

        var rentPeriod = getSelectedTagFilterDataId('#rentPeriodTag')
        if (rentPeriod) {
            params.rent_period = rentPeriod
        }
        var bedroomCount = getSelectedTagFilterDataId('#bedroomCountTag')
        if (bedroomCount) {
            params.bedroom_count = bedroomCount
        }
        var space = getSelectedTagFilterDataId('#spaceTag')
        if (space) {
            params.space = space
        }

        var rentAvailableTime
        if($('[name=rentPeriodStartDate]').val()){
            rentAvailableTime = new Date($('#rentPeriodStartDate').val()).getTime() / 1000
            params.rent_available_time = rentAvailableTime
        }

        var rentDeadlineTime
        if($('[name=rentPeriodEndDate]').val()) {
            rentDeadlineTime = new Date($('#rentPeriodEndDate').val()).getTime() / 1000
            if(rentDeadlineTime) {
                params.rent_deadline_time = rentDeadlineTime
            }
        }
        params = _.extend(params, filterOfNeighborhoodSubwaySchool.getParam())
        //Empty map list

        window.currantModule.clearMapPins()

        $.betterPost('/api/1/rent_ticket/search', params)
            .done(function (val) {
                var array = val
                //TODO: All rents must have location, filter those have no location
                if (!_.isEmpty(array)) {
                    window.currantModule.loadMapPins(array, function (result, callback) {
                        $.betterPost('/api/1/rent_ticket/'+result.id)
                            .done(function (val) {
                                if (!_.isEmpty(val)) {
                                    var houseResult = _.template($('#houseInfobox_template').html())({rent: val})
                                    callback(houseResult)
                                }
                            }).fail(function () {

                            }).always(function () {

                            })
                    })
                }else{
                    window.alert(window.i18n('暂无结果'))
                }
            }).fail(function () {

            }).always(function () {

            })
    }
    /*
     * Resize height of top category filter for different screen size
     *
     * */
    window.resizeCategory = function () {
        var $categoryWrapper = $('.category_wrapper')
        var $category = $categoryWrapper.find('.category')

        if (window.team.isPhone()) {
            $categoryWrapper.css({'height': 'auto'});
            $category.css('margin-top', '0')
            $categoryWrapper.show()
        }
        else {
            var availHeight = window.screen.availHeight
            var wrapperHeight = availHeight / 8.0 > 100 ? availHeight / 8.0 : 100
            var categoryHeight = 40
            $categoryWrapper.css({'height': wrapperHeight + 'px'});
            $category.css('margin-top', (wrapperHeight - categoryHeight) / 2 + 'px')
            $categoryWrapper.show()
        }
    };

    $(window.resizeCategory);
    $(window).on('resize', window.resizeCategory);

    /*
     * Make List/Map tab fixed to screen
     *
     * */
    window.updateTabSelectorFixed = function () {
        if (!window.team.isPhone()) {
            var scrollOffset = $(window).scrollTop()
            var $list = $('.tabContent').width() > 0 ? $('#result_list') : $('#emptyPlaceHolder')
            var listTop = $list.offset().top
            var listHeight = $list.height()
            var $tabSelector = $('.tabSelector')
            var tabLeft = $list.offset().left - 60
            if (scrollOffset > listTop + listHeight - 20) {
                $tabSelector.css({'position': 'static', 'top': '0', left: '0', 'margin-top': '0x'})
            }
            else if (scrollOffset > listTop - 20) {
                $tabSelector.css({'position': 'fixed', 'top': '20px', left: tabLeft, 'margin-top': '0'})
            }
            else {
                $tabSelector.css({'position': 'static', 'top': '0', left: '0', 'margin-top': '0x'})
            }
        }
    }
    /*function updateFilterPosition () {
        var timer, filterTop
        function update () {
            clearTimeout(timer)
            timer = setTimeout(function () {
                if (!window.team.isPhone()) {
                    var scrollOffset = $(window).scrollTop()
                    var $filter = $('#result .tags')
                    filterTop = filterTop || $filter.offset().top
                    $filter.css({
                        'position': 'relative'
                    })
                    if (scrollOffset >= filterTop) {
                        $filter.stop().animate({
                            'top': (scrollOffset - filterTop) + 'px'
                        })
                    } else {
                        $filter.stop().animate({
                            'top': '0px'
                        })
                    }
                }
            },50)
        }
        $(window).scroll(update);
    }
    updateFilterPosition()*/
    $(window).scroll(window.updateTabSelectorFixed);
    $(window).resize(window.updateTabSelectorFixed);
 })()



