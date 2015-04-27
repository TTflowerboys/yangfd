(function () {
    var itemsPerPage = 5
    var lastItemTime
    var isLoading = false
    var isAllItemsLoaded = false

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

    // Init top filters value from URL
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

    function loadRentList() {
        var params = {'per_page': itemsPerPage}
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
        var rentType = $('select[name=rentType]').children('option:selected').val()
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

        if (lastItemTime) {
            params.last_modified_time = lastItemTime
            //Load more triggered
            ga('send', 'event', 'rent_list', 'trigger', 'load-more')
        }

        $('#result_list_container').show()
        $('.emptyPlaceHolder').hide();
        $('#number_container').text(window.i18n('加载中'))
        $('#number_container').show()

        $('#loadIndicator').show()
        isLoading = true

        var totalResultCount = getCurrentTotalCount()
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
            $numberContainer.text(window.i18n('共找到下列出租房'))
            $numberContainer.show()
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


    /*
     * All Interactions with top filters
     *
     * */
    var $countrySelect = $('select[name=propertyCountry]')
    $countrySelect.change(function () {
        ga('send', 'event', 'rent_list', 'change', 'select-country',
            $('select[name=propertyCountry]').children('option:selected').text())
        location.href = window.team.setQuery('country',
            $('select[name=propertyCountry]').children('option:selected').val())
    })

    var $citySelect = $('select[name=propertyCity]')
    $citySelect.change(function () {
        ga('send', 'event', 'rent_list', 'change', 'select-city',
            $('select[name=propertyCity]').children('option:selected').text())
        location.href = window.team.setQuery('city', $('select[name=propertyCity]').children('option:selected').val())

    })

    var $propertyTypeSelect = $('select[name=propertyType]')
    $propertyTypeSelect.change(function () {
        ga('send', 'event', 'rent_list', 'change', 'select-proprty-type',
            $('select[name=propertyType]').children('option:selected').text())
        location.href = window.team.setQuery('property_type',
            $('select[name=propertyType]').children('option:selected').val())
    })

    var $rentTypeSelect = $('select[name=rentType]')
    $rentTypeSelect.change(function () {
        ga('send', 'event', 'rent_list', 'change', 'select-rent-type',
            $('select[name=rentType]').children('option:selected').text())
        location.href = window.team.setQuery('rent_type', $('select[name=rentType]').children('option:selected').val())
    })


    function selectCountry(id) {
        $('select[name=propertyCountry]').find('option[value=' + id + ']').prop('selected', true)
    }

    function selectCity(id) {
        $('select[name=propertyCity]').find('option[value=' + id + ']').prop('selected', true)
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
        var $item = $(event.target)
        var alreadySelected = $item.hasClass('selected')
        var $parent = $(event.target.parentNode)
        $parent.find('.toggleTag').removeClass('selected')

        if (!alreadySelected) {
            $item.addClass('selected')
        }

        ga('send', 'event', 'rent_list', 'change', 'change-property-type', $item.text())
        location.href = window.team.setQuery('property_type', getSelectedTagFilterDataId('#propertyTypeTag'))
    })

    $('#tags #rentBudgetTag').on('click', '.toggleTag', function (event) {
        var $item = $(event.target)
        var alreadySelected = $item.hasClass('selected')
        var $parent = $(event.target.parentNode)
        $parent.find('.toggleTag').removeClass('selected')

        if (!alreadySelected) {
            $item.addClass('selected')
        }

        ga('send', 'event', 'rent_list', 'change', 'change-rent-budget', $item.text())
        location.href = window.team.setQuery('rent_budget', getSelectedTagFilterDataId('#rentBudgetTag'))
    })

    $('#tags #rentPeriodTag').on('click', '.toggleTag', function (event) {
        var $item = $(event.target)
        var alreadySelected = $item.hasClass('selected')
        var $parent = $(event.target.parentNode)
        $parent.find('.toggleTag').removeClass('selected')

        if (!alreadySelected) {
            $item.addClass('selected')
        }

        ga('send', 'event', 'rent_list', 'change', 'change-rent-period', $item.text())
        location.href = window.team.setQuery('rent_period', getSelectedTagFilterDataId('#rentPeriodTag'))
    })

    $('#tags #bedroomCountTag').on('click', '.toggleTag', function (event) {
        var $item = $(event.target)
        var alreadySelected = $item.hasClass('selected')
        var $parent = $(event.target.parentNode)
        $parent.find('.toggleTag').removeClass('selected')

        if (!alreadySelected) {
            $item.addClass('selected')
        }

        ga('send', 'event', 'rent_list', 'change', 'change-bedroomCount', $item.text())
        location.href = window.team.setQuery('bedroom_count', getSelectedTagFilterDataId('#bedroomCountTag'))
    })

    $('#tags #spaceTag').on('click', '.toggleTag', function (event) {
        var $item = $(event.target)
        var alreadySelected = $item.hasClass('selected')
        var $parent = $(event.target.parentNode)
        $parent.find('.toggleTag').removeClass('selected')

        if (!alreadySelected) {
            $item.addClass('selected')
        }

        ga('send', 'event', 'rent_list', 'change', 'change-space', $item.text())
        location.href = window.team.setQuery('space', getSelectedTagFilterDataId('#spaceTag'))
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

    $(window).scroll(function () {

        if ($('[data-tab-name=list]').is(':visible')) {
            var scrollPos = $(window).scrollTop()
            var windowHeight = $(window).height()
            var listHeight = $('#result_list').height()
            var requireToScrollHeight = listHeight

            setTimeout(function () {
                if (windowHeight + scrollPos > requireToScrollHeight) {
                    if (!isLoading && !isAllItemsLoaded) {
                        loadRentList()
                    }
                }
            }, 200)
        }
    })
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
