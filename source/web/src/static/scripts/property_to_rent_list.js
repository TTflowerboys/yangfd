(function () {
    var itemsPerPage = 5
    var lastItemTime
    var isLoading = false
    var isAllItemsLoaded = false
    var viewMode = 'list'

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

        var rentBudgetType = getSelectedTagFilterDataId('#rentBudgetTag')
        if (rentBudgetType) {
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






    var countryFromURL = window.team.getQuery('country', location.href)
    if (countryFromURL) {
        selectCountry(countryFromURL)
    }

    var cityFromURL = window.team.getQuery('city', location.href)
    if (cityFromURL) {
        selectCity(cityFromURL)
    }

    var propertyTypeFromURL = window.team.getQuery('property_type', location.href)
    if (propertyTypeFromURL) {
        selectPropertyType(propertyTypeFromURL)

        selectTagFilter('#propertyTypeTag', propertyTypeFromURL)

        if (window.team.isPhone()) {
            showTagsOnMobile()
        }
    }

    var rentTypeFromURL = window.team.getQuery('rent_type', location.href)
    if (rentTypeFromURL) {
        selectRentType(rentTypeFromURL)
        selectTagFilter('#rentTypeTag', rentTypeFromURL)
        if (window.team.isPhone()) {
            showTagsOnMobile()
        }
    }

    // Init side tag filters value from URL
    var rentBudgetFromURL = window.team.getQuery('rent_budget', location.href)
    if (rentBudgetFromURL) {
        selectTagFilter('#rentBudgetTag', rentBudgetFromURL)

        if (window.team.isPhone()) {
            showTagsOnMobile()
        }
    }

    var rentPeriodFromURL = window.team.getQuery('rent_period', location.href)
    if (rentPeriodFromURL) {
        selectTagFilter('#rentPeriodTag', rentPeriodFromURL)

        if (window.team.isPhone()) {
            showTagsOnMobile()
        }
    }

    var bedroomFromURL = window.team.getQuery('bedroom_count', location.href)
    if (bedroomFromURL) {
        selectTagFilter('#bedroomCountTag', bedroomFromURL)

        if (window.team.isPhone()) {
            showTagsOnMobile()
        }
    }

    var spaceFromURL = window.team.getQuery('space', location.href)
    if (spaceFromURL) {
        selectTagFilter('#spaceTag', spaceFromURL)

        if (window.team.isPhone()) {
            showTagsOnMobile()
        }
    }

    //在城市选择上使用chosen插件
    function initChosen (elem, config) {
        var defaultConfit = {
            width: '100%',
            disable_search_threshold: 8
        }
        config = _.extend(defaultConfit, config)
        if(!window.team.isPhone()) {
            elem.chosen(config)
        } else {
            elem.chosenPhone(config)
        }
    }
    initChosen($('[name=propertyCountry]'))
    initChosen($('[name=propertyCity]'))
    initChosen($('[name=propertyType]'))
    initChosen($('[name=rentType]'))

    function InitFilterOfNeighborhoodSubwaySchool() { //初始化"街区/地铁/学校"的filter

        var _this = this
        _this.Event = $('<i></i>')
        var $container = $('.selectNeighborhoodSubwaySchoolWrap')
        var $containerAll = $container.add($container.prev('span')).add($container.next('span'))
        $containerAll.hide()
        var $citySelect = $('[name=propertyCity]')
        var $countrySelect = $('[name=propertyCountry]')
        var dataMap = {
            neighborhood: {
                country: ['GB'],
                city: ['London']
            },
            school: {
                country: ['GB'],
                city: ['*']
            },
            subwayLine: {
                country: [],
                city: []
            },
        }
        var selectMap = {
            parent: $container.find('[name=parent]'),
            neighborhood: $container.find('[name=neighborhood]'),
            school: $container.find('[name=school]'),
            subwayLine: $container.find('[name=subwayLine]'),
            subwayStation: $container.find('[name=subwayStation]')
        }
        var chosenMap = {}
        var parentSelectHtml = selectMap.parent.html()

        _.each(selectMap, function (elem) {
            if(!window.team.isPhone()) {
                elem.chosen({
                    disable_search_threshold: 8,
                    inherit_select_classes: true,
                    display_disabled_options: false,
                    width: '240px'
                })

            } else {
                elem.chosenPhone({
                    disable_search_threshold: 8,
                    inherit_select_classes: true,
                    display_disabled_options: false,
                })
            }
            elem.bind('change', function () {
                _this.Event.trigger('action')
            })
            chosenMap[elem.attr('name')] = elem.next('.chosen-container')
        })
        var getListAction = {
            neighborhood: function getNeighborhoodList (city) {
                window.geonamesApi.getNeighborhood(city, function (val) {
                    selectMap.neighborhood.html(
                        _.reduce(val, function(pre, val, key) {
                            return pre + '<option value="' + val.id + '">' + val.name + (val.parent && val.parent.name ? ', ' + val.parent.name : '') + '</option>'
                        }, '<option value="">' + i18n('请选择街区') + '</option>')
                    ).trigger('chosen:updated').trigger('chosen:open')
                })
            },
            school: function getSchoolList(params) {
                window.geonamesApi.getSchool(params, function (val) {
                    selectMap.school.html(
                        _.reduce(val, function(pre, val, key) {
                            return pre + '<option value="' + val.id + '">' + val.name + (val.parent && val.parent.name ? ', ' + val.parent.name : '') + '</option>'
                        }, '<option value="">' + i18n('请选择学校') + '</option>')
                    ).trigger('chosen:updated').trigger('chosen:open')
                })
            },
            subwayLine: function getSubwayLineList () {

            }
        }
        function initDisplayByCity() {
            var city = $citySelect.val()
            //var country = $countrySelect.val()
            var cityName = $citySelect.find(':selected').text().trim()
            if (_.every(dataMap, function (obj) {
                    return obj.city.indexOf(cityName) < 0 && obj.city.indexOf('*') < 0
                })) {
                $containerAll.parent('.category').removeClass('three')
                $containerAll.hide()
                return
            } else {
                $containerAll.parent('.category').addClass('three')
            }
            selectMap.parent.html(parentSelectHtml)
            _.each(dataMap, function (obj, key) {
                if(obj.city.indexOf(cityName) < 0 && obj.city.indexOf('*') < 0) {
                    selectMap.parent.find('[value=' + key + ']').prop('disabled', true)
                } else {
                    if(key !== 'school') { //学校数据无法根据城市来搜索，目前直接搜全国的
                        getListAction[key].call(null, city)
                    }
                    selectMap.parent.find('[value=' + key + ']').prop('disabled', false)
                }
            })
            selectMap.parent.trigger('chosen:updated')
            showChosen('parent')
            if(window.team.isPhone()) {
                $container.show()
            } else{
                $containerAll.show()
            }
        }
        function initDisplayByCountry () {
            var country = $countrySelect.val()
            var cityName = $citySelect.find(':selected').text().trim()
            if (_.every(dataMap, function (obj) {
                    return obj.country.indexOf(country) < 0 && obj.country.indexOf('*') < 0
                })) {
                $containerAll.parent('.category').removeClass('three')
                $containerAll.hide()
                return
            } else {
                $containerAll.parent('.category').addClass('three')
            }
            selectMap.parent.html(parentSelectHtml)
            _.each(dataMap, function (obj, key) {
                if((obj.country.indexOf(country) < 0 && obj.country.indexOf('*') < 0) || (obj.city.indexOf(cityName) < 0 && obj.city.indexOf('*') < 0)) {
                    selectMap.parent.find('[value=' + key + ']').prop('disabled', true)
                } else {
                    if(key === 'school') { //学校数据无法根据城市来搜索，目前直接搜全国的
                        getListAction[key].call(null, {
                            country: country
                        })
                    }
                    selectMap.parent.find('[value=' + key + ']').prop('disabled', false)
                }
            })
            selectMap.parent.trigger('chosen:updated')
            showChosen('parent')
            if(window.team.isPhone()) {
                $container.show()
            } else{
                $containerAll.show()
            }
        }
        initDisplayByCountry()
        initDisplayByCity()
        $citySelect.bind('change', function () {
            //var city = $citySelect.val()
            //var cityName = $citySelect.find(':selected').text().trim()
            _.each(selectMap, function (elem) {
                elem.val('').trigger('change')
            })
            initDisplayByCity()
        })
        $countrySelect.bind('change', function () {
            _.each(selectMap, function (elem) {
                elem.val('').trigger('change')
            })
            initDisplayByCountry()
        })

        function showChosen(name) {
            //console.log('showChosen was called by name :' + name)
            _.each(chosenMap, function (chosen, key) {
                if(name !== key) {
                    chosen.hide()
                } else {
                    chosen.show()
                    //openChosen(key)
                }
            })
        }
        function openChosen(name) {
            setTimeout(function(){
                //console.log('openChosen was called by name :' + name)
                selectMap[name].trigger('chosen:open')
            },100)
        }
        showChosen('parent')
        var actionMap = {
            neighborhood: function neighborhood() {
                showChosen('neighborhood')
                openChosen('neighborhood')
            },
            school: function school() {
                showChosen('school')
                openChosen('school')
            },
            subwayLine: function subway() {
                showChosen('subwayLine')
                openChosen('subwayLine')
            }
        }
        selectMap.parent.bind('change', function () {
            if(selectMap.parent.val()) {
                actionMap[selectMap.parent.val()].call(null)
            }
        })
        function addEvent(elem, event, listener, capture) {
            if(elem.addEventListener){
                elem.addEventListener(event, listener, capture)
            } else {
                $(elem).bind(event, listener)
            }
        }
        _.each(chosenMap, function (elem, key) {
            if(key === 'parent') {
                return
            }
            addEvent(document.body, 'mousedown', function (event) {
                //需要在子选项展开前跳到父选项，所以在此处要使用事件捕获来阻止.chosen-container上的鼠标按下事件冒泡
                if($(event.target).parents('.chosen-container').length && $(event.target).parents('.chosen-container').is(elem) && $(event.target).parents('.chosen-single').length){
                    selectMap[key].val('').trigger('change').trigger('chosen:updated')
                    selectMap.parent.val('').trigger('change').trigger('chosen:updated')
                    showChosen('parent')
                    openChosen('parent')
                    event.stopPropagation()
                }
            }, true)
            /*elem.on('click', '.chosen-single', function (e) {
                openChosen('parent')
                showChosen('parent')
                selectMap[key].val('').trigger('change').trigger('chosen:updated')
                selectMap.parent.val('').trigger('change').trigger('chosen:updated')
            })*/
        })
        _this.getParam = function getParamOfNeighborhoodSubwaySchool() {
            var param = {}
            if(selectMap.parent.val() && selectMap[selectMap.parent.val()].val()) {
                param[selectMap[selectMap.parent.val()].attr('data-serialize')] = selectMap[selectMap.parent.val()].val()
            }
            return param
        }

        _this.Event.bind('action', function () {
            _this.param = _this.param || {}
            var param = _this.getParam()
            if(!_.isEqual(_this.param, param)) {
                _this.Event.trigger('change')
                _this.param = param
            }
        })
    }
    var filterOfNeighborhoodSubwaySchool = new InitFilterOfNeighborhoodSubwaySchool()
    filterOfNeighborhoodSubwaySchool.Event.bind('change', function () {
        //console.log('change:')
        //console.log(filterOfNeighborhoodSubwaySchool.getParam())
        loadRentListByView()
    })
    // Init top filters value from URL

    // Init load rent property list
    loadRentList()

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

    function updateCityByCountry(countryCode){
        var params = {
            'country': countryCode,
            'feature_code': 'city'
        }
        if (window.betterAjaxXhr && window.betterAjaxXhr['/api/1/geonames/search'] && window.betterAjaxXhr['/api/1/geonames/search'].readyState !== 4) {
            window.betterAjaxXhr['/api/1/geonames/search'].abort()
        }
        //Empty city select
        $('select[name=propertyCity]').html('<option value="">' + i18n('城市列表加载中...') + '</option>').trigger('chosen:updated')

        //Load city data
        $.betterPost('/api/1/geonames/search', params)
            .done(function (val) {
                $('select[name=propertyCity]').html(
                    _.reduce(val, function(pre, val, key) {
                        return pre + '<option value="' + val.id + '">' + val.name + (countryCode === 'US' ? ' (' + val.admin1 + ')' : '') + '</option>' //美国的城市有很多重名，要在后面加上州名缩写
                    }, '<option value="">' + i18n('任意城市') + '</option>')
                ).trigger('chosen:updated')
            })
            .fail(function(){
            })
    }
    function clearCity() {
        $('select[name=propertyCity]').html('<option value="">' + i18n('任意城市') + '</option>').trigger('chosen:updated')
    }

    function loadRentList(reload) {
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

            }).fail(function () {
        }).always(function () {
                updateResultCount(totalResultCount)
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
        if(viewMode === 'list'){
            lastItemTime = null
            loadRentList(true)
        }else if(viewMode === 'map'){
            loadRentMapList()
        }
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
            updateCityByCountry(countryCode)
        } else {
            clearCity()
        }
        loadRentListByView()
    })

    var $citySelect = $('select[name=propertyCity]')
    $citySelect.change(function () {

        ga('send', 'event', 'rent_list', 'change', 'select-city',
            $('select[name=propertyCity]').children('option:selected').text())
        loadRentListByView()
    })

    var $propertyTypeSelect = $('select[name=propertyType]')
    $propertyTypeSelect.change(function () {

        ga('send', 'event', 'rent_list', 'change', 'select-proprty-type',
            $('select[name=propertyType]').children('option:selected').text())
        loadRentListByView()
    })

    var $rentTypeSelect = $('select[name=rentType]')
    $rentTypeSelect.change(function () {

        ga('send', 'event', 'rent_list', 'change', 'select-rent-type',
            $('select[name=rentType]').children('option:selected').text())
        loadRentListByView()
    })


    function selectCountry(code) {
        $('select[name=propertyCountry]').find('option[value=' + code + ']').prop('selected', true)
    }

    function selectCity(id) {
        $('select[name=propertyCity]').find('option[value=' + id + ']').prop('selected', true).trigger('chosen:updated')
    }

    function selectPropertyType(id) {
        $('select[name=propertyType]').find('option[value=' + id + ']').prop('selected', true)
    }

    function selectRentType(id) {
        $('select[name=rentType]').find('option[value=' + id + ']').prop('selected', true)
    }


    /*
     * Interactions with side tag filters
     * */

    function selectTagFilter(tag, dataid) {
        var $item = $('#tags ' + tag).find('[data-id=' + dataid + ']')
        var $parent = $item.parent()
        $parent.find('.toggleTag').removeClass('selected')
        $item.addClass('selected')
    }

    function getSelectedTagFilterDataId(tag) {
        var $selectedChild = $('#tags ' + tag).children('.selected')
        if ($selectedChild.length) {
            return $selectedChild.first().attr('data-id')
        }
        return ''
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

    $('#tags #rentBudgetTag').on('click', '.toggleTag', function (event) {
        event.stopPropagation()

        var $item = $(event.target)
        var alreadySelected = $item.hasClass('selected')
        var $parent = $(event.target.parentNode)
        $parent.find('.toggleTag').removeClass('selected')

        if (!alreadySelected) {
            $item.addClass('selected')
        }

        ga('send', 'event', 'rent_list', 'change', 'change-rent-budget', $item.text())
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

    $('.calendar .clear').bind('click', function(event){
        $(this).siblings('input').val('').trigger('change').attr('placeholder', i18n('请选择日期'))
    })
    $('.confirmDate').click(function () {

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
        if ($('[data-tab-name=list]').is(':visible')) {
            if(needLoad()) {
                $('.isAllLoadedInfo').hide()
                loadRentList()
            }
        }
    }
    $(window).scroll(autoLoad)
    $(document).ready(function () {
        setTimeout(function () {
            autoLoad()
        }, 200)
    })
    /*
    * Map View
    * */
    var bingMapKey = 'AhibVPHzPshn8-vEIdCx0so7vCuuLPSMK7qLP3gej-HyzvYv4GJWbc4_FmRvbh43'

    window.mapCache = {}
    window.mapPinCache = {}
    window.mapInfoBoxLayerCache = {}

    window.getMap = function (mapId) {
        if (!window.mapCache[mapId]) {
           var map = new Microsoft.Maps.Map(document.getElementById(mapId), {credentials: bingMapKey});
            window.mapCache[mapId] = map
        }
        return window.mapCache[mapId]
    }

    function createMapPin(map, layer, mapId, result) {
        if (result && result.latitude && result.longitude) {
            var location = new Microsoft.Maps.Location(result.latitude, result.longitude);
            var pin = new Microsoft.Maps.Pushpin(location, {icon: '/static/images/property_details/icon-location-building.png', width: 30, height: 45});

            layer.push(pin)
            Microsoft.Maps.Events.addHandler(pin, 'click', function () { showInfoBox(map, mapId, result) });
            if  (!window.mapPinCache[mapId]) {
                window.mapPinCache[mapId] = []
            }
            window.mapPinCache[mapId].push(pin)
        }
    }


    function showInfoBox(map, mapId, result) {
        if (window.mapInfoBoxLayerCache[mapId]) {
            map.entities.remove(window.mapInfoBoxLayerCache[mapId]);
        }
        var location = new Microsoft.Maps.Location(result.latitude, result.longitude);
        var layer = new Microsoft.Maps.EntityCollection()
        var infoboxOptions = null
        if (window.team.isPhone()) {
            infoboxOptions = {offset:new Microsoft.Maps.Point(-90,50) };
        }
        else {
            infoboxOptions = {offset:new Microsoft.Maps.Point(-160,50) };
        }
        var infobox = new Microsoft.Maps.Infobox(location, infoboxOptions);
        $.betterPost('/api/1/rent_ticket/'+result.id)
            .done(function (val) {
                if (!_.isEmpty(val)) {

                    var houseResult = _.template($('#houseInfobox_template').html())({rent: val})
                    infobox.setHtmlContent(houseResult)

                    layer.push(infobox)
                    layer.setOptions({ visible: true });
                    map.entities.push(layer);
                    ajustMapPosition(map, layer.get(0), location)
                    window.mapInfoBoxLayerCache[mapId] = layer
                }
            }).fail(function () {

            }).always(function () {

            })
    }

    //http://stackoverflow.com/questions/11148042/bing-maps-invoke-click-event-on-pushpin
    function ajustMapPosition(map, infobox, location) {

        var buffer = 70;
        var infoboxOffset = infobox.getOffset();
        var infoboxAnchor = infobox.getAnchor();
        var infoboxLocation = map.tryLocationToPixel(location, Microsoft.Maps.PixelReference.control);
        var dx = infoboxLocation.x + infoboxOffset.x - infoboxAnchor.x;
        var dy = infoboxLocation.y - 25 - infoboxAnchor.y;

        if (dy < buffer) { //Infobox overlaps with top of map.
            //#### Offset in opposite direction.
            dy *= -1;
            //#### add buffer from the top edge of the map.
            dy += buffer;
        } else {
            //#### If dy is greater than zero than it does not overlap.

            dy = map.getHeight() - infoboxLocation.y + infoboxAnchor.y;
            if (dy > buffer) {
                dy = 0;
            } else {
                dy -= buffer;
            }
        }

        if (dx < buffer) { //Check to see if overlapping with left side of map.
            //#### Offset in opposite direction.
            dx *= -1;
            //#### add a buffer from the left edge of the map.
            dx += buffer;
        } else { //Check to see if overlapping with right side of map.
            dx = map.getWidth() - infoboxLocation.x + infoboxAnchor.x - infobox.getWidth() / 2;
            //#### If dx is greater than zero then it does not overlap.
            if (dx > buffer) {
                dx = 0;
            } else {
                //#### add a buffer from the right edge of the map.
                dx -= buffer;
            }
        }

        //#### Adjust the map so infobox is in view
        if (dx !== 0 || dy !== 0) {
            map.setView({
                centerOffset: new Microsoft.Maps.Point(dx, dy),
                center: map.getCenter()
            });
        }
    }

    function updateMapResults(map, mapId, searchResults) {
        var layer = new Microsoft.Maps.EntityCollection()
        for (var i = 0; i < searchResults.length; i++) {
            createMapPin(map, layer, mapId, searchResults[i]);
        }
        map.entities.push(layer)
    }

    function getBestMapOptions(locations, mapWidth, mapHeight) {
        var center = new Microsoft.Maps.Location();
        var zoomLevel = 0;

        var maxLat = -85;
        var minLat = 85;
        var maxLon = -180;
        var minLon = 180;

        //calculate bounding rectangle
        for (var i = 0; i < locations.length; i++)
        {
            if (locations[i].latitude > maxLat)
            {
                maxLat = locations[i].latitude;
            }

            if (locations[i].latitude < minLat)
            {
                minLat = locations[i].latitude;
            }

            if (locations[i].longitude > maxLon)
            {
                maxLon = locations[i].longitude;
            }

            if (locations[i].longitude < minLon)
            {
                minLon = locations[i].longitude;
            }
        }

        center.latitude = (maxLat + minLat) / 2;
        center.longitude = (maxLon + minLon) / 2;

        var zoom1=0, zoom2=0;

        //Determine the best zoom level based on the map scale and bounding coordinate information
        if (maxLon !== minLon && maxLat !== minLat)
        {
            //best zoom level based on map width
            zoom1 = Math.log(360.0 / 256.0 * mapWidth / (maxLon - minLon)) / Math.log(2);
            //best zoom level based on map height
            zoom2 = Math.log(180.0 / 256.0 * mapHeight / (maxLat - minLat)) / Math.log(2);
        }

        //use the most zoomed out of the two zoom levels
        zoomLevel = Math.round((zoom1 < zoom2) ? zoom1 : zoom2);
        if (zoomLevel > 0) {
            zoomLevel = zoomLevel - 1; //left more around margin
        }else {
            zoomLevel = 13 //Default zoom level is 10
        }
        return {zoom:zoomLevel , center:center}

    }

    function updateMap() {
        var mapId = 'mapCanvas'
        var map = window.getMap(mapId)
        map.entities.clear();
        updateMapResults(map, mapId, window.rentMapList)

        var locations = []
        _.each(window.rentMapList, function (rent) {
            if(rent.latitude && rent.longitude){
                var location = new Microsoft.Maps.Location(rent.latitude, rent.longitude)
                locations.push(location)
            }
        })
        map.setView(getBestMapOptions(locations, $('#' + mapId).width(), $('#' + mapId).height()))
        $('html, body').animate({scrollTop: $('#' + mapId).offset().top - 60 }, 'fast')
    }

    function emptyMapPins() {
        window.rentMapList = []

        var mapId = 'mapCanvas'
        var map = window.getMap(mapId)
        map.entities.clear();
    }

    $('[data-tabs]').tabs({trigger: 'click'}).on('openTab', function (event, target, tabName) {
        if (tabName === 'map') {
            viewMode = 'map'
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
        }else if (tabName === 'list') {
            viewMode = 'list'
            loadRentList(true)
        }
    })

    $('.tabSelector_phone').click(function (e) {
        var currentTab = $(this).attr('data-tab')
        var $tabContainer = $('[data-tabs]')
        var tabName = ''
        var $tabContents = null

        if (currentTab === 'list'){
            viewMode = 'map'
            //to show map
            tabName = 'map'
            $tabContents = $tabContainer.find('[data-tab-name=' + tabName + ']')
            $tabContents.addClass('selectedTab').show()
            $tabContents.siblings().removeClass('selectedTab').hide()
            $tabContainer.trigger('openTab', [$('.tabSelector [tab-name=' + tabName + ']'), tabName])
            $(this).attr('data-tab', 'map')
        }
        else {
            viewMode = 'list'
            //to show list
            tabName = 'list'
            $tabContents = $tabContainer.find('[data-tab-name=' + tabName + ']')
            $tabContents.addClass('selectedTab').show()
            $tabContents.siblings().removeClass('selectedTab').hide()
            $tabContainer.trigger('openTab', [$('.tabSelector [tab-name=' + tabName + ']'), tabName])
            $(this).attr('data-tab', 'list')
        }
    })


    function loadRentMapList() {
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

        var rentBudgetType = getSelectedTagFilterDataId('#rentBudgetTag')
        if (rentBudgetType) {
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
        emptyMapPins()

        $.betterPost('/api/1/rent_ticket/search', params)
            .done(function (val) {
                var array = val
                //TODO: All rents must have location, filter those have no location
                if (!_.isEmpty(array)) {
                    window.rentMapList = array
                    updateMap()
                }else{
                    window.alert(window.i18n('暂无结果'))
                }
            }).fail(function () {

            }).always(function () {

            })
    }
 })()


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
$(window).scroll(window.updateTabSelectorFixed);
$(window).resize(window.updateTabSelectorFixed);
