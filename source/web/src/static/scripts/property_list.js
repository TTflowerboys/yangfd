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

// window.updateTagsFixed = function () {
//     if (!window.team.isPhone()) {
//         var scrollOffset = $(window).scrollTop()
//         var $list = $('#result_list').width() > 0 ? $('#result_list'): $('#emptyPlaceHolder')
//         var listTop = $list.offset().top
//         var $tags = $('#tags')
//         var listWidth = $list.width()
//         var tagsLeft = $list.offset().left + listWidth + 60
//         if (scrollOffset > listTop - 20) {
//             $tags.css({'position':'fixed', 'top':'20px', left:tagsLeft, 'margin-top':'0'})
//         }
//         else {
//             $tags.css({'position':'static', 'top':'0', left:'0', 'margin-top': '140px'})
//         }
//     }
// }

// $(window).scroll(window.updateTagsFixed);
// $(window).resize(window.updateTagsFixed);

(function () {
    var lastItemTimeDic = {}
    var budgetTotalResultCountDic = {}
    var budgetCurrentResultCountDic = {}
    var isLoading = false

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


    function getCurrentTotalCount() {
        if (window.team.isPhone()) {
            return $('#result_list').children('.houseCard_phone').length
        }
        else {
            return $('#result_list').children('.houseCard').length
        }
    }

    function getBudgetCurrentTotalCount(budgetId) {
        return $('#addtionalResultList').children('[data-budget-id=' + budgetId + ']').length
    }


    function updatePropertyCardMouseEnter() {
        $('.houseCard').mouseenter(function (event) {
            $(event.delegateTarget).find('button.openRequirement').show()
        });

        $('.houseCard').mouseleave(function (event) {
            $(event.delegateTarget).find('button.openRequirement').hide()
        });
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
            return parseFloat(range[1]) < parseFloat(baseRange[1])
        }
        else if (baseRange[1] === '') {
            return parseFloat(range[0]) > parseFloat(baseRange[1])
        }
        else {
            return (parseFloat(range[0]) > parseFloat(baseRange[0]) && parseFloat(range[0]) < parseFloat(baseRange[1])) ||
                (parseFloat(range[1]) > parseFloat(baseRange[0]) && parseFloat(range[1]) < parseFloat(baseRange[1]))
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
            if (house.main_house_types) {
                house.main_house_types = _.filter(house.main_house_types, function (house_type) {
                    var priceCheck = true
                    var bedroomCountCheck = true
                    var buildingAreaCheck = true
                    if (budgetRange) {
                        priceCheck = house_type.total_price_min && house_type.total_price_min.value && isRangeMatch([house_type.total_price_min.value, house_type.total_price_max.value],
                            budgetRange)
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

    function loadPropertyList() {
        var params = {'per_page': '5'}
        var country = $('select[name=propertyCountry]').children('option:selected').val()
        if (country) {
            params.country = country
        }
        var city = $('select[name=propertyCity]').children('option:selected').val()
        if (city) {
            params.city = city
        }
        var propertyType = $('select[name=propertyType]').children('option:selected').val()
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
        var lastItemTime = getLastItemTimeByBudget(budgetType)
        if (lastItemTime) {
            params.mtime = lastItemTime

            //Load more triggered
            ga('send', 'event', 'property_list', 'trigger', 'load-more')
        }

        $('#result_list_container').show()
        showEmptyPlaceHolder(false)
        $('#number_container').text(window.i18n('加载中'))
        $('#number_container').show()

        $('#loadIndicator').show()
        isLoading = true

        var totalResultCount = getCurrentTotalCount()
        $.betterPost('/api/1/property/search', params)
            .done(function (val) {
                var array = val.content
                totalResultCount = val.count
                array = filterPropertyHouseTypes(array, budgetType, bedroomCount, buildingArea)
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

                    setLastItemTimeBudget(budgetType, lastItemTime)
                    setTotalResultCountByBudget(budgetType, totalResultCount)
                    setCurrentResultCountByBudget(budgetType, getCurrentTotalCount())

                    updatePropertyCardMouseEnter()


                }

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

    function loadAddtionalPropertyList(budgetType) {
        var params = {'per_page': '5', 'budget': budgetType}
        var country = $('select[name=propertyCountry]').children('option:selected').val()
        if (country) {
            params.country = country
        }
        var city = $('select[name=propertyCity]').children('option:selected').val()
        if (city) {
            params.city = city
        }
        var propertyType = $('select[name=propertyType]').children('option:selected').val()
        if (propertyType) {
            params.property_type = propertyType
        }

        var intention = getSelectedIntention()
        if (intention) {
            params.intention = intention
        }
        var bedroomCount = getSelectedTagFilterDataId('#bedroomCountTag')
        if (bedroomCount) {
            params.bedroom_count = bedroomCount
        }
        var buildingArea = getSelectedTagFilterDataId('#buildAreaTag')
        if (buildingArea) {
            params.building_area = buildingArea
        }

        var lastItemTime = getLastItemTimeByBudget(budgetType)
        if (lastItemTime) {
            params.mtime = lastItemTime
        }

        $('#loadIndicator').show()
        isLoading = true

        $.betterPost('/api/1/property/search', params)
            .done(function (val) {
                var array = val.content
                var totalResultCount = val.count
                array = filterPropertyHouseTypes(array, budgetType, bedroomCount, buildingArea)
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


    function isBudgetLoadFinished(id) {
        var totalCount = getTotalResultCountByBudget(id)
        var currentCount = getCurrentTotalCount(id)
        if (totalCount && currentCount) {
            return getTotalResultCountByBudget(id) === getCurrentResultCountByBudget(id)
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
    //             var item = '<option value=' + city.id + '>' + city.value + '</option>'
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

    function selectCountry(id) {
        $('select[name=propertyCountry]').find('option[value=' + id + ']').prop('selected', true)
    }

    function selectCity(id) {
        $('select[name=propertyCity]').find('option[value=' + id + ']').prop('selected', true)
    }

    function selectPropertyType(id) {
        $('select[name=propertyType]').find('option[value=' + id + ']').prop('selected', true)
    }


    function updateResultCount(count) {
        var $numberContainer = $('#number_container')
        //var $number = $numberContainer.find('#number')
        setTotalResultCountByBudget(getSelectedTagFilterDataId('#budgetTag'), count)
        setCurrentResultCountByBudget(getSelectedTagFilterDataId('#budgetTag'), getCurrentTotalCount())
        if (count) {
            //$number.text(count)
            $numberContainer.text(window.i18n('共找到下列房产'))
            $numberContainer.show()
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

            var description = window.i18n('我想在') + ' ' +
                selectedCountry + ' ' +
                window.i18n('的') + ' ' +
                selectedCity + ' ' +
                window.i18n('投资') + ' ' +
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

    // function updateBrowserTitle(){
    //     var updatedTitle = $('select[name=propertyCountry]').children('option:selected').text() + ' ' +
    //         $('select[name=propertyCity]').children('option:selected').text() + ' ' +
    //         $('select[name=propertyType]').children('option:selected').text() + ' ' + window.i18n('房产列表 洋房东')

    //     $(document).prop('title', updatedTitle)
    // }

    // function updateUserTags() {
    //     var budgetId = getSelectedTagFilterDataId('#budgetTag')
    //     var intentionIds = getSelectedIntention()

    //     $.betterPost('/api/1/user/edit', {'budget':budgetId, 'intention':intentionIds})
    //         .done(function (data) {
    //             window.user= data
    //         })
    //         .fail(function (ret) {
    //         })
    //         .always(function () {

    //         })
    // }

    $(function () {
        window.countryData = getData('countryData')
        window.cityData = getData('cityData')
        window.propertyCountryData = getData('propertyCountryData')
        window.propertyCityData = getData('propertyCityData')
        window.propertyTypeData = getData('propertyTypeData')
        window.intentionData = getData('intentionData')
        window.budgetData = getData('budgetData')
        window.bedroomCountData = getData('bedroomCountData')
        window.buildingAreaData = getData('buildingAreaData')

        var $countrySelect = $('select[name=propertyCountry]')
        $countrySelect.change(function () {
            ga('send', 'event', 'property_list', 'change', 'select-country',
                $('select[name=propertyCountry]').children('option:selected').text())
            location.href = window.team.setQuery('country',
                $('select[name=propertyCountry]').children('option:selected').val())
        })

        var $citySelect = $('select[name=propertyCity]')
        $citySelect.change(function () {
            ga('send', 'event', 'property_list', 'change', 'select-city',
                $('select[name=propertyCity]').children('option:selected').text())
            location.href = window.team.setQuery('city',
                $('select[name=propertyCity]').children('option:selected').val())

        })

        var $propertyTypeSelect = $('select[name=propertyType]')
        $propertyTypeSelect.change(function () {
            ga('send', 'event', 'property_list', 'change', 'select-proprty-type',
                $('select[name=propertyType]').children('option:selected').text())
            location.href = window.team.setQuery('property_type',
                $('select[name=propertyType]').children('option:selected').val())
        })
    })


    $('#tags #budgetTag').on('click', '.toggleTag', function (event) {

        var $item = $(event.target)
        var alreadySelected = $item.hasClass('selected')
        var $parent = $(event.target.parentNode)
        $parent.find('.toggleTag').removeClass('selected')

        if (!alreadySelected) {
            $item.addClass('selected')
        }

        ga('send', 'event', 'property_list', 'change', 'change-budget', $item.text())
        location.href = window.team.setQuery('budget', getSelectedTagFilterDataId('#budgetTag'))
    })

    $('#tags #intentionTag').on('click', '.toggleTag', function (event) {

        var $item = $(event.target)
        if ($item.hasClass('selected')) {
            $item.removeClass('selected')
        }
        else {
            $item.addClass('selected')
        }

        ga('send', 'event', 'property_list', 'change', 'change-intention', $item.text())
        location.href = window.team.setQuery('intention', getSelectedIntention())
    })

    $('#tags #bedroomCountTag').on('click', '.toggleTag', function (event) {
        var $item = $(event.target)
        var alreadySelected = $item.hasClass('selected')
        var $parent = $(event.target.parentNode)
        $parent.find('.toggleTag').removeClass('selected')

        if (!alreadySelected) {
            $item.addClass('selected')
        }

        ga('send', 'event', 'property_list', 'change', 'change-bedroomCount', $item.text())
        location.href = window.team.setQuery('bedroom_count', getSelectedTagFilterDataId('#bedroomCountTag'))
    })

    $('#tags #buildingAreaTag').on('click', '.toggleTag', function (event) {
        var $item = $(event.target)
        var alreadySelected = $item.hasClass('selected')
        var $parent = $(event.target.parentNode)
        $parent.find('.toggleTag').removeClass('selected')

        if (!alreadySelected) {
            $item.addClass('selected')
        }

        ga('send', 'event', 'property_list', 'change', 'change-buildingArea', $item.text())
        location.href = window.team.setQuery('building_area', getSelectedTagFilterDataId('#buildAreaTag'))
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

    loadPropertyList()


    $(window).scroll(function () {

        if ($('[data-tab-name=list]').is(':visible')) {
           // var scrollPos = $(window).scrollTop()
            var windowHeight = $(window).height()
            var listHeight = $('#result_list').height()
            var itemCount = getCurrentTotalCount()
            var requireToScrollHeight = listHeight
            if (itemCount > 1) {
                requireToScrollHeight = listHeight * 0.6
            }

            setTimeout(function () {
                if (windowHeight +  $(window).scrollTop() > requireToScrollHeight) {
                    if (!isLoading) {
                        if (isCurrentBudgetLoadFinished()) {
                            if (!window.team.isPhone()) {
                                var budget = getCurrentBelowNotFinishedBudget()
                                if (budget) {
                                    loadAddtionalPropertyList(budget)
                                }
                            }
                        }
                        else {
                            loadPropertyList()
                        }
                    }
                }
            }, 200)
        }
    })
})()
