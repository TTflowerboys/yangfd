(function () {
    var lastItemTimeDic = {}
    var budgetTotalResultCountDic = {}
    var budgetCurrentResultCountDic = {}
    var isLoading = false
    var lastItemTime
    var viewMode = 'list'
    var additionalReload = false

    window.countryData = getData('countryData')
    window.cityData = getData('cityData')
    window.propertyCountryData = getData('propertyCountryData')
    window.propertyCityData = getData('propertyCityData')
    window.propertyTypeData = getData('propertyTypeData')
    window.intentionData = getData('intentionData')
    window.budgetData = getData('budgetData')
    window.bedroomCountData = getData('bedroomCountData')
    window.buildingAreaData = getData('buildingAreaData')

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
            if(!params.hesa_university){
                params.per_page = 5
            }

            isLoading = true
            var totalResultCount = 0
            $.betterPost('/api/1/property/search', params)
                .done(function (val) {
                    var array = val.content
                    totalResultCount = val.count
                    array = filterPropertyHouseTypes(array, params.budget, params.bedroom_count, params.building_area)
                    var resultHtml = ''
                    if (!_.isEmpty(array)) {
                        lastItemTime = _.last(array).mtime
                        window.propertyList = array
                        _.each(array, function (house) {
                            var houseResult = _.template($('#houseCard_template').html())({house: house})
                            resultHtml += houseResult

                            if (lastItemTime > house.mtime) {
                                lastItemTime = house.mtime
                            }
                        })
                        $('#result_list').html(resultHtml)
                        setLastItemTimeBudget(params.budget, lastItemTime)
                        setTotalResultCountByBudget(params.budget, totalResultCount)
                        setCurrentResultCountByBudget(params.budget, getCurrentTotalCount())

                        updatePropertyCardMouseEnter()
                    }
                    /*if(isCurrentBudgetLoadFinished()) {
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

    //used in mobile client
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
        var budgetType = getSelectedTagFilterDataId('#budgetTag')
        if (budgetType) {
            params.budget = budgetType
        }

        var intention = getSelectedIntention()
        if (intention) {
            params.intention = intention
        }
        var bedroomCount = getSelectedTagFilterDataId('#bedroomCountTag')
        if (bedroomCount) {
            params.bedroom_count = bedroomCount
        }
        var buildingArea = getSelectedTagFilterDataId('#buildingAreaTag')
        if (buildingArea) {
            params.building_area = buildingArea
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
        var selectedType = getSelectedTagValueWithTagName('propertyTypeTag')
        var selectedBudget = getSelectedBudgetTypeValue()
        var selectedIntention = getSelectedIntentionValue()
        var selectedBedroomCount = getSelectedBedroomCountValue()
        var selectedBuildingArea = getSelectedBuildingAreaValue()

        if (_.last(selectedIntention) === ',') {
            selectedIntention = selectedIntention.substring(0, selectedIntention.length - 1)
        }
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
        add(selectedType)
        add(selectedBudget)
        add(selectedIntention)
        add(selectedBedroomCount)
        add(selectedBuildingArea)
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


        if (window.team.isPhone()) {
            showTags()
        }
    }

    var intentionFromURL = window.team.getQuery('intention', location.href)
    if (intentionFromURL) {
        removeAllSelectedIntentions() //remove all selected, only use the url intention
        selectIntention(intentionFromURL)

        if (window.team.isPhone()) {
            showTags()
        }
    }

    var budgetFromURL = window.team.getQuery('budget', location.href)
    if (budgetFromURL) {
        selectBudget(budgetFromURL)

        if (window.team.isPhone()) {
            showTags()
        }
    }

    var bedroomFromURL = window.team.getQuery('bedroom_count', location.href)
    if (bedroomFromURL) {
        selectBedroom(bedroomFromURL)

        if (window.team.isPhone()) {
            showTags()
        }
    }

    var buildingAreaFromURL = window.team.getQuery('building_area', location.href)
    if (buildingAreaFromURL) {
        selectBuildingArea(buildingAreaFromURL)

        if (window.team.isPhone()) {
            showTags()
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

    var filterOfNeighborhoodSubwaySchool = new window.currantModule.InitFilterOfNeighborhoodSubwaySchool({
        citySelect: $('[name=propertyCity]'),
        countrySelect: $('[name=propertyCountry]')
    })
    filterOfNeighborhoodSubwaySchool.Event.bind('change', function () {
        //console.log('change:')
        //console.log(filterOfNeighborhoodSubwaySchool.getParam())
        loadPropertyListByView()
    })

    loadPropertyList(true)

    /*
    * Load Data from server
    * */
    function getCurrentTotalCount() {
        if (window.team.isPhone()) {
            return $('#result_list').children('.houseCard_phone_new').length
        }
        else {
            return $('#result_list').children('.houseCard').length
        }
    }

   function getBudgetCurrentTotalCount(budgetId) {
        if (getSelectedTagFilterDataId('#budgetTag') === budgetId) {
            return getCurrentTotalCount()
        }
        else {
            return $('#addtionalResultList').children('[data-budget-id=' + budgetId + ']').length
        }
    }

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

    function isRangeMatch(range, baseRange) {
        if (baseRange[0] === '' && baseRange[1] === '') {
            return true
        }
        else if (baseRange[0] === '') {
            return parseFloat(range[1]) <= parseFloat(baseRange[1])
        }
        else if (baseRange[1] === '') {
            return parseFloat(range[0]) >= parseFloat(baseRange[1])
        }
        else {
            return (parseFloat(range[0]) >= parseFloat(baseRange[0]) && parseFloat(range[0]) <= parseFloat(baseRange[1])) ||
                (parseFloat(range[1]) >= parseFloat(baseRange[0]) && parseFloat(range[1]) <= parseFloat(baseRange[1]))
        }
        return false
    }

    function filterPropertyHouseTypes(array, budgetType, bedroomCount, buildingArea) {
        var budgetRange = null
        if (budgetType) {
            budgetRange = getEnumRange(getEnumDataById(window.budgetData, budgetType))
        }
        var bedroomRange = null
        if (bedroomCount) {
            bedroomRange = getEnumRange(getEnumDataById(window.bedroomCountData, bedroomCount))
        }
        var buildingAreaRange = null
        if (buildingArea) {
            buildingAreaRange = getEnumRange(getEnumDataById(window.buildingAreaData, buildingArea))
        }
        _.each(array, function (house) {
            if (house.property_type && (house.property_type.slug === 'new_property' || house.property_type.slug === 'student_housing') && house.main_house_types && house.main_house_types.length) {
                house.main_house_types = _.filter(house.main_house_types, function (house_type) {
                    var priceCheck = true
                    var bedroomCountCheck = true
                    var buildingAreaCheck = true
                    if (budgetRange) {
                        if(house_type.total_price_min && house_type.total_price_min.localized_unit && house_type.total_price_max.localized_unit){
                            priceCheck = house_type.total_price_min.localized_value && isRangeMatch([house_type.total_price_min.localized_value, house_type.total_price_max.localized_value],
                                budgetRange)
                        }else{
                            priceCheck = house_type.total_price_min && house_type.total_price_min.value && isRangeMatch([house_type.total_price_min.value, house_type.total_price_max.value],
                                budgetRange)
                        }
                    }
                    if (bedroomRange) {
                        bedroomCountCheck = parseInt(house_type.bedroom_count) >= parseInt(bedroomRange[0]) && parseInt(house_type.bedroom_count) <= parseInt(bedroomRange[1])
                    }
                    if (buildingAreaRange) {
                        buildingAreaCheck = house_type.building_area_min && house_type.building_area_min.value && isRangeMatch([house_type.building_area_min.value, house_type.building_area_max.value],
                            buildingAreaRange)
                    }

                    return priceCheck && bedroomCountCheck && buildingAreaCheck
                })
            }
        })
        return array
    }

    function updateCityByCountry(countryCode) {
        if (window.betterAjaxXhr && window.betterAjaxXhr['/api/1/geonames/search'] && window.betterAjaxXhr['/api/1/geonames/search'].readyState !== 4) {
            window.betterAjaxXhr['/api/1/geonames/search'].abort()
        }
        var params = {
            'country': countryCode,
            'feature_code': 'city'
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

    function loadPropertyListByView() {
        if(viewMode === 'list'){
            lastItemTime = null
            loadPropertyList(true)
        }else if(viewMode === 'map'){
            loadPropertyMapList()
        }
    }

    function loadPropertyList(reload) {
        if (window.betterAjaxXhr && window.betterAjaxXhr['/api/1/property/search'] && window.betterAjaxXhr['/api/1/property/search'].readyState !== 4) {
            window.betterAjaxXhr['/api/1/property/search'].abort()
        }
        var params = window.getBaseRequestParams()
        if(!params.hesa_university){
            params.per_page = 5
        }
        var lastItemTime = getLastItemTimeByBudget(params.budget)
        $('.isAllLoadedInfo').hide()
        if (lastItemTime) {
            params.mtime = lastItemTime

            //Load more triggered
            ga('send', 'event', 'property_list', 'trigger', 'load-more')
        }

        if(reload){
            //Clean up property list
            $('#result_list').empty()
            lastItemTime = null
            delete params.mtime
            clearAllBudgetDic()

            //Clean up additional property list
            $('#addtionalResultList_wrapper').hide()
            $('#addtionalResultList').empty()
            //Set additional list to reload
            additionalReload = true
        }

        $('#result_list_container').show()
        showEmptyPlaceHolder(false)
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

        $.betterPost('/api/1/property/search', params)
            .done(function (val) {
                var array = val.content
                totalResultCount = val.count
                array = filterPropertyHouseTypes(array, params.budget, params.bedroom_count, params.building_area)
                if (!_.isEmpty(array)) {
                    lastItemTime = _.last(array).mtime

                    if (!window.propertyList) {
                        window.propertyList = []
                    }
                    window.propertyList = window.propertyList.concat(array)

                    _.each(array, function (house) {
                        var houseResult = _.template($('#houseCard_template').html())({house: house})
                        $('#result_list').append(houseResult)

                        if (lastItemTime > house.mtime) {
                            lastItemTime = house.mtime
                        }
                    })

                    setLastItemTimeBudget(params.budget, lastItemTime)
                    setTotalResultCountByBudget(params.budget, totalResultCount)
                    setCurrentResultCountByBudget(params.budget, getCurrentTotalCount())

                    updatePropertyCardMouseEnter()
                }
                /*if(isCurrentBudgetLoadFinished()) {
                    $('.isAllLoadedInfo').show()
                }*/

            })
            .fail(function () {
            })
            .always(function () {
                updateResultCount(totalResultCount)
                isLoading = false
                $('#loadIndicator').hide()
                if (!window.team.isCurrantClient()) {
                    window.updateTabSelectorVisibility(true)
                }
            })
    }

    /*
     * Load Addtional Property Data
     * */
    function loadAddtionalPropertyList(budgetType,reload) {
        var params = window.getBaseRequestParams()
        if(!params.hesa_university){
            params.per_page = 6
        }
        params.budget = budgetType

        var lastItemTime = getLastItemTimeByBudget(budgetType)
        if (lastItemTime) {
            params.mtime = lastItemTime
        }

        $('#loadIndicator').show()
        isLoading = true

        if(reload){
            params.mtime = null
            additionalReload = false
            //clearCurrentBelowBudgetDic()
        }

        $.betterPost('/api/1/property/search', params)
            .done(function (val) {
                var array = val.content
                var totalResultCount = val.count
                array = filterPropertyHouseTypes(array, budgetType, params.bedroom_count, params.building_area)
                if (!_.isEmpty(array)) {

                    lastItemTime = _.last(array).mtime

                    var index = $('#addtionalResultList').children('.addtionalHouseCard').length - 1
                    _.each(array, function (house) {
                        index = index + 1
                        var houseResult = _.template($('#addtional_houseCard_template').html())({house: house, budgetId: budgetType, index: index})
                        $('#addtionalResultList').append(houseResult)

                        if (lastItemTime > house.mtime) {
                            lastItemTime = house.mtime
                        }
                    })

                    setLastItemTimeBudget(budgetType, lastItemTime)
                    setTotalResultCountByBudget(budgetType, totalResultCount)
                    setCurrentResultCountByBudget(budgetType, getBudgetCurrentTotalCount(budgetType))
                    $('#addtionalResultList_wrapper').show()
                }

            })
            .fail(function () {
            })
            .always(function () {
                $('#loadIndicator').hide()
                isLoading = false
            })
    }

    function getLastItemTimeByBudget(id) {
        if (id) {
            return lastItemTimeDic[id]
        }
        else {
            return lastItemTimeDic.all
        }
    }

    function getTotalResultCountByBudget(id) {
        if (id) {
            return budgetTotalResultCountDic[id]
        }
        else {
            return budgetTotalResultCountDic.all
        }
    }

    function getCurrentResultCountByBudget(id) {
        if (id) {
            return budgetCurrentResultCountDic[id]
        }
        else {
            return budgetCurrentResultCountDic.all
        }
    }

    function setLastItemTimeBudget(id, time) {
        if (id) {
            lastItemTimeDic[id] = time
        }
        else {
            lastItemTimeDic.all = time
        }
    }

    function setTotalResultCountByBudget(id, count) {
        if (id) {
            budgetTotalResultCountDic[id] = count
        }
        else {
            budgetTotalResultCountDic.all = count
        }
    }

    function setCurrentResultCountByBudget(id, count) {
        if (id) {
            budgetCurrentResultCountDic[id] = count
        }
        else {
            budgetCurrentResultCountDic.all = count
        }
    }

    function clearAllBudgetDic() {
        lastItemTimeDic = {}
        budgetTotalResultCountDic = {}
        budgetCurrentResultCountDic = {}
    }

    // function clearCurrentBelowBudgetDic() {
    //     var selectedBudgetId = getSelectedTagFilterDataId('#budgetTag')
    //     var dic = {}
    //     if (lastItemTimeDic[selectedBudgetId]) {
    //         dic = {}
    //         dic[selectedBudgetId] = lastItemTimeDic[selectedBudgetId]
    //         lastItemTimeDic = dic
    //     }
    //     else {
    //         lastItemTimeDic = {}
    //     }

    //      if (budgetTotalResultCountDic[selectedBudgetId]) {
    //         dic = {}
    //         dic[selectedBudgetId] = budgetTotalResultCountDic[selectedBudgetId]
    //         budgetTotalResultCountDic = dic
    //     }
    //     else {
    //         budgetTotalResultCountDic = {}
    //     }

    //      if (budgetCurrentResultCountDic[selectedBudgetId]) {
    //         dic = {}
    //         dic[selectedBudgetId] = budgetCurrentResultCountDic[selectedBudgetId]
    //         budgetCurrentResultCountDic = dic
    //     }
    //     else {
    //         budgetCurrentResultCountDic = {}
    //     }
    // }

    function isBudgetLoadFinished(id) {
        var totalCount = getTotalResultCountByBudget(id)
        var currentCount = getCurrentResultCountByBudget(id)
        if (totalCount && currentCount) {
            return totalCount === currentCount
        }
        else {
            //here these two count is undefined.
            return false
        }
    }

    function isCurrentBudgetLoadFinished() {
        return isBudgetLoadFinished(getSelectedTagFilterDataId('#budgetTag'))
    }

    function getCurrentBelowNotFinishedBudget() {
        /*
         1. must have one selected budget
         2. the budget must not the lowest one
         3. current budget load all data, no more
         4. below budget not load all data, not finished
         */

        var $selectedChild = $('#tags #budgetTag').children('.selected')
        if ($selectedChild.length) {
            $selectedChild = $selectedChild.first()
            if (parseInt($selectedChild.attr('data-index')) > 0) {
                if (isCurrentBudgetLoadFinished()) {
                    var budgetIndex = $selectedChild.attr('data-index')
                    budgetIndex = budgetIndex - 1
                    var $child = null
                    while (budgetIndex >= 0) {
                        $child = $('#tags #budgetTag').children('[data-index=' + budgetIndex + ']')
                        if (!isBudgetLoadFinished($child.attr('data-id'))) {
                            return $child.attr('data-id')
                        }
                        budgetIndex = budgetIndex - 1
                    }
                }
            }
        }
        return null
    }

    function getData(key) {
        return JSON.parse(document.getElementById(key).innerHTML)
    }

    // function resetData() {
    //     $('#result_list').empty()
    //     lastItemTime = undefined
    // }

    // function resetCityDataWhenCountryChange() {
    //     var selectedCountryId = $('select[name=propertyCountry]').children('option:selected').val()
    //     var $citySelect = $('select[name=propertyCity]')
    //     $citySelect.empty()
    //     $citySelect.append('<option value=>' + window.i18n('任意城市') + '</option>')
    //     _.each(window.propertyCityData, function (city) {
    //         if (!selectedCountryId || city.country.id === selectedCountryId) {
    //             var item = '<option value=' + city.id + '>' + city.name + '</option>'
    //             $citySelect.append(item)
    //         }
    //     })
    // }

    function getSelectedTagFilterDataId(tag) {
        var $selectedChild = $('#tags ' + tag).children('.selected')
        if ($selectedChild.length) {
            return $selectedChild.first().attr('data-id')
        }
        return ''
    }

    function getSelectedBudgetTypeValue() {
        var $selectedChild = $('#tags #budgetTag').children('.selected')
        if ($selectedChild.length) {
            return $selectedChild.first().text()
        }
        return ''
    }

    function getEnumDataById(data, id) {
        var selectedItem = null
        _.each(data, function (item) {
            if (item.id === id) {
                selectedItem = item
            }
        })
        return selectedItem
    }

    function getEnumRange(budgetEnum) {
        var slug = budgetEnum.slug
        var enumAndValue = slug.split(':')
        if (enumAndValue && enumAndValue.length === 2) {
            var enumValueArray = enumAndValue[1].split(',')
            if (enumValueArray && enumValueArray.length >= 2) {
                return [enumValueArray[0], enumValueArray[1]]
            }
        }

        return []
    }


    function getSelectedIntention() {
        var $selectedChildren = $('#tags #intentionTag').children('.selected')
        if ($selectedChildren.length) {
            var ids = ''
            _.each($selectedChildren, function (child) {
                ids += child.getAttribute('data-id')
                ids += ','
            })

            return ids.slice(0, -1)
        }
        return ''
    }


    function getSelectedIntentionValue() {
        var $selectedChildren = $('#tags #intentionTag').children('.selected')
        if ($selectedChildren.length) {
            var textValue = ''
            _.each($selectedChildren, function (child) {
                textValue += $(child).text().trim()
                textValue += ','
            })
            return textValue.slice(0, -1)
        }
        return ''
    }

    function getSelectedBedroomCountValue() {
        var $selectedChild = $('#tags #bedroomCountTag').children('.selected')
        if ($selectedChild.length) {
            return $selectedChild.first().text()
        }
        return ''
    }

    function getSelectedBuildingAreaValue() {
        var $selectedChild = $('#tags #buildingAreaTag').children('.selected')
        if ($selectedChild.length) {
            return $selectedChild.first().text()
        }
        return ''
    }

    function selectBudget(id) {
        var $item = $('#tags #budgetTag').find('[data-id=' + id + ']')
        var $parent = $item.parent()
        $parent.find('.toggleTag').removeClass('selected')
        $item.addClass('selected')
    }

    function removeAllSelectedIntentions() {
        $('#tags #intentionTag').find('.toggleTag').toggleClass('selected', false)
    }

    function selectIntention(idList) {
        var ids = idList.split(',')
        _.each(ids, function (id) {
            $('#tags #intentionTag').find('[data-id=' + id + ']').toggleClass('selected', true)
        })
    }

    function selectBedroom(count) {
        var $item = $('#tags #bedroomCountTag').find('[data-id=' + count + ']')
        var $parent = $item.parent()
        $parent.find('.toggleTag').removeClass('selected')
        $item.addClass('selected')
    }

    function selectBuildingArea(id) {
        var $item = $('#tags #buildingAreaTag').find('[data-id=' + id + ']')
        var $parent = $item.parent()
        $parent.find('.toggleTag').removeClass('selected')
        $item.addClass('selected')
    }

    function selectCountry(code) {
        $('select[name=propertyCountry]').find('option[value=' + code + ']').prop('selected', true)
    }

    function selectCity(id) {
        $('select[name=propertyCity]').find('option[value=' + id + ']').prop('selected', true).trigger('chosen:updated')
    }

    function selectPropertyType(id) {
        $('select[name=propertyType]').find('option[value=' + id + ']').prop('selected', true)
        $('#tags #propertyTypeTag').find('[data-id=' + id + ']').toggleClass('selected', true)
    }


    function updateResultCount(count) {
        var $numberContainer = $('#number_container')
        //var $number = $numberContainer.find('#number')
        setTotalResultCountByBudget(getSelectedTagFilterDataId('#budgetTag'), count)
        setCurrentResultCountByBudget(getSelectedTagFilterDataId('#budgetTag'), getCurrentTotalCount())
        if (count) {
            //$number.text(count)
            if(!team.isPhone()){
                $numberContainer.text(window.i18n('共找到下列房产'))
                $numberContainer.show()
            }

            $('#result_list_container').show()
            showEmptyPlaceHolder(false)
        }
        else {
            //$number.text(count)
            $('#result_list_container').hide()
            showEmptyPlaceHolder(true)

            ga('send', 'event', 'property_list', 'result', 'empty-result',
                $('.emptyPlaceHolder').find('textarea[name=description]').text())
        }
    }

    function showEmptyPlaceHolder(show) {
        var emptyPlaceHolder = $('.emptyPlaceHolder');
        if (show) {
            window.resetRequirementForm(emptyPlaceHolder)
            var selectedBudgetId = getSelectedTagFilterDataId('#budgetTag')
            emptyPlaceHolder.find('select[name=budget] option[value=' + selectedBudgetId + ']').attr('selected', true)
            var selectedCountry = $('select[name=propertyCountry]').children('option:selected').text()
            var selectedCity = $('select[name=propertyCity]').children('option:selected').text()
            var selectedType = $('select[name=propertyType]').children('option:selected').text()
            var selectedBudget = getSelectedBudgetTypeValue()
            var selectedIntention = getSelectedIntentionValue()
            var selectedBedroomCount = getSelectedBedroomCountValue()
            var selectedBuildingArea = getSelectedBuildingAreaValue()

            if (_.last(selectedIntention) === ',') {
                selectedIntention = selectedIntention.substring(0, selectedIntention.length - 1)
            }

            var description = window.i18n('我想投资在') + ' ' +
                selectedCountry + ' ' +
                window.i18n('的') + ' ' +
                selectedCity + ' ' +
                selectedType

            if (selectedBudget) {
                description = description +
                    window.i18n('，价值为') + ' ' +
                    selectedBudget + ' '
            }

            if (selectedIntention) {
                description = description + window.i18n('的房产，投资意向为') + ' ' +
                    selectedIntention
            }

            if (selectedBedroomCount) {
                description = description + window.i18n('，居室数为') + ' ' +
                    selectedBedroomCount
            }

            if (selectedBuildingArea) {
                description = description + window.i18n('，面积为') + ' ' +
                    selectedBuildingArea
            }

            description = description + window.i18n('。')

            emptyPlaceHolder.find('textarea[name=description]').text(description)

            window.setupRequirementForm(emptyPlaceHolder, function () {
            })
            emptyPlaceHolder.show();
        }
        else {
            emptyPlaceHolder.hide()
        }
    }

    function updatePropertyCardMouseEnter() {
        $('.houseCard').mouseenter(function (event) {
            $(event.delegateTarget).find('button.openRequirement').show()
        });

        $('.houseCard').mouseleave(function (event) {
            $(event.delegateTarget).find('button.openRequirement').hide()
        });
    }


    var $countrySelect = $('select[name=propertyCountry]')
    $countrySelect.change(function () {
        var countryCode = $('select[name=propertyCountry]').children('option:selected').val()

        ga('send', 'event', 'property_list', 'change', 'select-country',
            $('select[name=propertyCountry]').children('option:selected').text())
        if(countryCode) {
            updateCityByCountry(countryCode)
        }else {
            clearCity()
        }
        loadPropertyListByView()
    }).trigger('change')

    var $citySelect = $('select[name=propertyCity]')
    $citySelect.change(function () {

        ga('send', 'event', 'property_list', 'change', 'select-city',
            $('select[name=propertyCity]').children('option:selected').text())
        loadPropertyListByView()

    })

    var $propertyTypeSelect = $('select[name=propertyType]')
    $propertyTypeSelect.change(function () {

        ga('send', 'event', 'property_list', 'change', 'select-proprty-type',
            $('select[name=propertyType]').children('option:selected').text())
        loadPropertyListByView()
    })
    $('#tags #propertyTypeTag').on('click', '.toggleTag', function (event) {
        event.stopPropagation()

        var $item = $(event.target)
        var alreadySelected = $item.hasClass('selected')
        var $parent = $(event.target.parentNode)
        $parent.find('.toggleTag').removeClass('selected')

        if (!alreadySelected) {
            $item.addClass('selected')
        }

        ga('send', 'event', 'property_list', 'change', 'change-property-type', $item.text())
        loadPropertyListByView()
    })

    $('#tags #budgetTag').on('click', '.toggleTag', function (event) {
        event.stopPropagation()

        var $item = $(event.target)
        var alreadySelected = $item.hasClass('selected')
        var $parent = $(event.target.parentNode)
        $parent.find('.toggleTag').removeClass('selected')

        if (!alreadySelected) {
            $item.addClass('selected')
        }

        ga('send', 'event', 'property_list', 'change', 'change-budget', $item.text())
        loadPropertyListByView()
    })

    $('#tags #intentionTag').on('click', '.toggleTag', function (event) {
        event.stopPropagation()

        var $item = $(event.target)
        if ($item.hasClass('selected')) {
            $item.removeClass('selected')
        }
        else {
            $item.addClass('selected')
        }

        ga('send', 'event', 'property_list', 'change', 'change-intention', $item.text())
        loadPropertyListByView()
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

        ga('send', 'event', 'property_list', 'change', 'change-bedroomCount', $item.text())
        loadPropertyListByView()
    })

    $('#tags #buildingAreaTag').on('click', '.toggleTag', function (event) {
        event.stopPropagation()

        var $item = $(event.target)
        var alreadySelected = $item.hasClass('selected')
        var $parent = $(event.target.parentNode)
        $parent.find('.toggleTag').removeClass('selected')

        if (!alreadySelected) {
            $item.addClass('selected')
        }

        ga('send', 'event', 'property_list', 'change', 'change-buildingArea', $item.text())
        loadPropertyListByView()
    })

    function showTags() {
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

    function hideTags() {
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
            showTags()
        }
        else {
            hideTags()
        }
    })

    //load first property list base on user's choose
    // if (window.user) {
    //     if (window.user.budget) {
    //         selectBudget(window.user.budget.id)
    //     }
    //     if (window.user.intention) {
    //         _.each(window.user.intention, function (item) {
    //             selectIntention(item.id)
    //         })
    //     }
    // }


    function autoLoad() {
        if ($('[data-tab-name=list]').is(':visible')) {
            // var scrollPos = $(window).scrollTop()
            var windowHeight = $(window).height()
            var listHeight = $('#result_list').height()
            var itemCount = getCurrentTotalCount()
            var requireToScrollHeight = listHeight
            if (itemCount > 1) {
                requireToScrollHeight = listHeight * 0.6
            }

            if (windowHeight +  $(window).scrollTop() > requireToScrollHeight) {
                if (!isLoading) {
                    if (isCurrentBudgetLoadFinished()) {
                        if (!window.team.isPhone()) {
                            var budget = getCurrentBelowNotFinishedBudget()
                            if (budget) {
                                loadAddtionalPropertyList(budget,additionalReload)
                            }
                        }
                    }
                    else {
                        $('.isAllLoadedInfo').hide()
                        loadPropertyList()
                    }
                }
            }
        }
    }
    $(window).scroll(autoLoad)
    $(document).ready(function () {
        setTimeout(function () {
            autoLoad()
        }, 200)
    })

    $('[data-tabs]').tabs({trigger: 'click'}).on('openTab', function (event, target, tabName) {
        if (tabName === 'map') {
            viewMode = 'map'
            if (typeof Microsoft === 'undefined'){
                var scriptString = '<script src="http://ecn.dev.virtualearth.net/mapcontrol/mapcontrol.ashx?v=7.0&onscriptload=onBingMapScriptLoad"></script>'
                window.onBingMapScriptLoad = function () {
                    if (typeof Microsoft === 'undefined') {
                        window.alert(window.i18n('地图加载失败'))
                    }
                    else {
                        loadPropertyMapList()
                    }
                }
                $('body').append(scriptString)
            }
            else {
                loadPropertyMapList()
            }
        }else if(tabName === 'list') {
            viewMode = 'list'
            loadPropertyList(true)
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

    function loadPropertyMapList() {
        if (window.betterAjaxXhr && window.betterAjaxXhr['/api/1/property/search'] && window.betterAjaxXhr['/api/1/property/search'].readyState !== 4) {
            window.betterAjaxXhr['/api/1/property/search'].abort()
        }
        var params = window.getBaseRequestParams()
        params.location_only = 1

        //Empty map list
        window.currantModule.clearMapPins()
        $.betterPost('/api/1/property/search', params)
            .done(function (val) {
                var array = val.content
                if (!_.isEmpty(array)) {
                    window.currantModule.loadMapPins(array, function (result, callback) {
                        $.betterPost('/api/1/property/'+result.id)
                            .done(function (val) {
                                if (!_.isEmpty(val)) {
                                    var houseResult = _.template($('#houseInfobox_template').html())({house: val})
                                    callback(houseResult)
                                }
                            }).fail(function () {

                            }).always(function () {

                            })
                    })
                }else{
                    //TODO: change empty dataset
                    window.alert(window.i18n('暂无结果'))
                }
            })
            .fail(function () {
            })
            .always(function () {
            })
    }
 })()

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
