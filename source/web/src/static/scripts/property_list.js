window.resizeCategory = function () {
    var $categoryWrapper = $('.category_wrapper')
    var $category = $categoryWrapper.find('.category')

    if (window.team.isPhone()) {
        $categoryWrapper.css({'height':'auto'});
        $category.css('margin-top', '0')
        $categoryWrapper.show()
    }
    else {
        var availHeight = window.screen.availHeight
        var wrapperHeight =  availHeight / 8.0 > 100 ? availHeight / 8.0 : 100
        var categoryHeight = 40
        $categoryWrapper.css({'height':wrapperHeight+'px'});
        $category.css('margin-top', (wrapperHeight - categoryHeight) / 2+ 'px')
        $categoryWrapper.show()
    }
};

$(window.resizeCategory);

$(window).on('resize', window.resizeCategory);

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

    var lastItemTime

    var onePageItemCount = 5
    //better check is phone cell
    var onePageMinItemCount = Math.ceil($('#main').height() / $('#houseCard_template').attr('data-cell-height'))
    if (onePageItemCount < onePageMinItemCount) {
        onePageItemCount = onePageMinItemCount;
    }


    function getCurrentTotalCount() {
        if (window.team.isPhone()) {
            return $('#result_list').children('.houseCard_phone').length
        }
        else {
            return $('#result_list').children('.houseCard').length
        }
    }


    function updatePropertyCardMouseEnter() {
        $('.houseCard').mouseenter(function(event){
            $(event.delegateTarget).find('button.openRequirement').show()
        });

        $('.houseCard').mouseleave(function(event){
            $(event.delegateTarget).find('button.openRequirement').hide()
        });
    }

    function loadPropertyList() {
        var params = {'per_page':'5', bedroom_count:'3'}
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
        var budgetType = getSelectedBudgetType()
        if (budgetType) {
            params.budget = budgetType
        }

        var intention = getSelectedIntention()
        if (intention) {
            params.intention = intention
        }
        var bedroomCount = getSelectedBedroomCount()
        if (bedroomCount) {
            params.bedroom_count = bedroomCount
        }
        var buildingArea = getSelectedBuildingArea()
        if (buildingArea) {
            params.building_area = buildingArea
        }
        if (lastItemTime) {
            params.mtime = lastItemTime

            //Load more triggered
            ga('send', 'event', 'property_list', 'trigger', 'load-more')
        }

        $('#result_list_container').show()
        showEmptyPlaceHolder(false)
        $('#result #number_container').text(window.i18n('加载中'))
        $('#result #number_container').show()


        $('#result #loadIndicator').show()
        $('#loadMore').hide()

        var totalResultCount = getCurrentTotalCount()
        $.betterPost('/api/1/property/search', params)
            .done(function (val) {
                var array = val.content
                totalResultCount = val.count
                if (!_.isEmpty(array)) {
                    lastItemTime = _.last(array).mtime
                    _.each(array, function (house) {
                        var houseResult = _.template($('#houseCard_template').html())({house: house})
                        $('#result_list').append(houseResult)

                        if (lastItemTime > house.mtime) {
                            lastItemTime = house.mtime
                        }
                    })
                    updatePropertyCardMouseEnter()

                    if (totalResultCount > getCurrentTotalCount()) {
                        $('#loadMore').show()
                    }
                    else {
                        $('#loadMore').hide()
                    }
                }
                else {
                    $('#loadMore').hide()
                }

            })
            .fail (function () {
                  $('#loadMore').show()
            })
            .always(function () {
                updateResultCount(totalResultCount)
                $('#result #loadIndicator').hide()
            })
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

    function getSelectedBudgetType() {
        var $selectedChild = $('#tags #budgetTag').children('.selected')
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

    function getSelectedBedroomCount() {
        var $selectedChild = $('#tags #bedroomCountTag').children('.selected')
        if ($selectedChild.length) {
            return $selectedChild.first().attr('data-value')
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

    function getSelectedBuildingArea() {
        var $selectedChild = $('#tags #buildingAreaTag').children('.selected')
        if ($selectedChild.length) {
            return $selectedChild.first().attr('data-id')
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


    function updateResultCount(count) {
        var $numberContainer = $('#result #number_container')
        //var $number = $numberContainer.find('#number')

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

            ga('send', 'event', 'property_list', 'result', 'empty-result',$('.emptyPlaceHolder').find('textarea[name=description]').text())
        }
    }

    function showEmptyPlaceHolder(show) {
        var emptyPlaceHolder = $('.emptyPlaceHolder');
        if (show) {
            window.resetRequirementForm(emptyPlaceHolder)
            var selectedBudgetId = getSelectedBudgetType()
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

            var description =  window.i18n('我想在') + ' ' +
                    selectedCountry + ' ' +
                    window.i18n('的') + ' ' +
                    selectedCity + ' ' +
                    window.i18n('投资')  + ' ' +
                    selectedType

            if (selectedBudget) {
                description = description  +
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
        var $item = $('#tags #bedroomCountTag').find('[data-value=' + count + ']')
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

    // function updateBrowserTitle(){
    //     var updatedTitle = $('select[name=propertyCountry]').children('option:selected').text() + ' ' +
    //         $('select[name=propertyCity]').children('option:selected').text() + ' ' +
    //         $('select[name=propertyType]').children('option:selected').text() + ' ' + window.i18n('房产列表 洋房东')

    //     $(document).prop('title', updatedTitle)
    // }

    // function updateUserTags() {
    //     var budgetId = getSelectedBudgetType()
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

        var $countrySelect = $('select[name=propertyCountry]')
        $countrySelect.change(function () {
            ga('send', 'event', 'property_list', 'change', 'select-country',$('select[name=propertyCountry]').children('option:selected').text())
            location.href = window.team.setQuery('country', $('select[name=propertyCountry]').children('option:selected').val())
        })

        var $citySelect = $('select[name=propertyCity]')
        $citySelect.change(function () {
            ga('send', 'event', 'property_list', 'change', 'select-city',$('select[name=propertyCity]').children('option:selected').text())
            location.href = window.team.setQuery('city', $('select[name=propertyCity]').children('option:selected').val())

        })

        var $propertyTypeSelect = $('select[name=propertyType]')
        $propertyTypeSelect.change(function () {
            ga('send', 'event', 'property_list', 'change', 'select-proprty-type',$('select[name=propertyType]').children('option:selected').text())
            location.href = window.team.setQuery('property_type', $('select[name=propertyType]').children('option:selected').val())
        })
    })


    $('#loadMore').click(function () {
        loadPropertyList()
    })


    $('#tags #budgetTag').on('click', '.toggleTag', function (event) {

        var $item = $(event.target)
        var alreadySelected = $item.hasClass('selected')
        var $parent = $(event.target.parentNode)
        $parent.find('.toggleTag').removeClass('selected')

        if (!alreadySelected) {
            $item.addClass('selected')
        }

        ga('send', 'event', 'property_list', 'change', 'change-budget',$item.text())
        location.href = window.team.setQuery('budget', getSelectedBudgetType())
    })

    $('#tags #intentionTag').on('click', '.toggleTag', function (event) {

        var $item = $(event.target)
        if ($item.hasClass('selected')) {
            $item.removeClass('selected')
        }
        else {
            $item.addClass('selected')
        }

        ga('send', 'event', 'property_list', 'change', 'change-intention',$item.text())
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

        ga('send', 'event', 'property_list', 'change', 'change-bedroomCount',$item.text())
        location.href = window.team.setQuery('bedroom_count', getSelectedBedroomCount())
    })

    $('#tags #buildingAreaTag').on('click', '.toggleTag', function (event) {
        var $item = $(event.target)
        var alreadySelected = $item.hasClass('selected')
        var $parent = $(event.target.parentNode)
        $parent.find('.toggleTag').removeClass('selected')

        if (!alreadySelected) {
            $item.addClass('selected')
        }

        ga('send', 'event', 'property_list', 'change', 'change-buildingArea',$item.text())
        location.href = window.team.setQuery('building_area', getSelectedBuildingArea())
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
            $tags.animate({'max-height':'0'}, 400, 'swing')
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

        if (window.team.isPhone()){
            showTags()
        }
    }

    var budgetFromURL = window.team.getQuery('budget', location.href)
    if (budgetFromURL) {
        selectBudget(budgetFromURL)

        if (window.team.isPhone()){
            showTags()
        }
    }

    var bedroomFromURL = window.team.getQuery('bedroom_count', location.href)
    if (bedroomFromURL) {
        selectBedroom(bedroomFromURL)

        if (window.team.isPhone()){
            showTags()
        }
    }

    var buildingAreaFromURL = window.team.getQuery('building_area', location.href)
    if (buildingAreaFromURL) {
        selectBuildingArea(buildingAreaFromURL)

        if (window.team.isPhone()){
            showTags()
        }
    }

    loadPropertyList()


    $(window).scroll(function () {
        var scrollPos = $(window).scrollTop()
        var windowHeight = $(window).height()
        var listHeight = $('#result_list').height()
        var itemCount = getCurrentTotalCount()
        var requireToScrollHeight = listHeight
        if (itemCount > 1) {
            requireToScrollHeight = parseInt(listHeight * (itemCount - 1) / itemCount)
        }

        setTimeout(function () {
            if (windowHeight  + scrollPos > requireToScrollHeight &&  $('#loadMore').is(':visible')) {
                loadPropertyList()
            }
        }, 200)
    })
})()
