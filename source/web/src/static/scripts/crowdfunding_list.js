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

window.updateTagsFixed = function () {
    if (!window.team.isPhone()) {
        var scrollOffset = $(window).scrollTop()
        var $list = $('#result_list').width() > 0 ? $('#result_list'): $('#emptyPlaceHolder')
        var listTop = $list.offset().top
        var $tags = $('#tags')
        var listWidth = $list.width()
        var tagsLeft = $list.offset().left + listWidth + 60
        if (scrollOffset > listTop - 20) {
            $tags.css({'position':'fixed', 'top':'20px', left:tagsLeft, 'margin-top':'0'})
        }
        else {
            $tags.css({'position':'static', 'top':'0', left:'0', 'margin-top': '140px'})
        }
    }
}

$(window).scroll(window.updateTagsFixed);
$(window).resize(window.updateTagsFixed);

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
            return $('#result_list').children('.houseCard_phone_new').length
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
        var params = {'per_page': onePageItemCount}
        var investmentType = getSelectedInvestmentType()
        if (investmentType) {
            params.investment_type = investmentType
        }

        var intention = getSelectedIntention()
        if (intention) {
            params.intention = intention
        }
        if (lastItemTime) {
            params.mtime = lastItemTime
        }

        $('#result_list_container').show()
        showEmptyPlaceHolder(false)
        $('#result #number_container').text(window.i18n('加载中'))
        $('#result #number_container').show()


        $('#result #loadIndicator').show()
        $('#loadMore').hide()

        //TODO: check mtime
        var totalResultCount = getCurrentTotalCount()
        $.betterPost('/api/1/shop/54a3c92b6b809945b0d996bf/item/search', params)
            .done(function (val) {
                var array = val
                totalResultCount += array.length
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

                    $('#loadMore').show()
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

    function resetData() {
        $('#result_list').empty()
        lastItemTime = undefined
    }

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

    function getSelectedInvestmentType() {
        var $selectedChildren = $('#tags #investmentTypeTag').children('.selected')
        if ($selectedChildren.length) {
            var ids = ''
            _.each($selectedChildren, function (child) {
                ids += child.getAttribute('data-id')
                ids += ','
            })
            return ids
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
            return ids
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
            return textValue
        }
        return ''
    }


    function updateResultCount(count) {

        if (count) {
            $('#result_list_container').show()
            showEmptyPlaceHolder(false)
        }
        else {
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

    function selectIntention(id) {
        $('#tags #intentionTag').find('[data-id=' + id + ']').toggleClass('selected', true)
    }

    $(function () {
        window.intentionData = getData('intentionData')
    })


    $('#loadMore').click(function () {
        loadPropertyList()
    })


    $('#tags #investmentTypeTag').on('click', '.toggleTag', function (event) {

        var $item = $(event.target)
        if ($item.hasClass('selected')) {
            $item.removeClass('selected')
        }
        else {
            $item.addClass('selected')
        }

        resetData()
        loadPropertyList()
        //updateUserTags()

    })

    $('#tags #intentionTag').on('click', '.toggleTag', function (event) {

        var $item = $(event.target)
        if ($item.hasClass('selected')) {
            $item.removeClass('selected')
        }
        else {
            $item.addClass('selected')
        }

        resetData()
        loadPropertyList()
        //updateUserTags()

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

    loadPropertyList()


    $(window).scroll(function () {
        var scrollPos = $(window).scrollTop();
        var windowHeight = $(window).height();
        var listHeight = $('#result_list').height();

        setTimeout(function () {
            if (windowHeight  + scrollPos > listHeight &&  $('#loadMore').is(':visible')) {
                loadPropertyList()
            }
        }, 500)
    })
})()
