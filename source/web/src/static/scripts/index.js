(function () {

    function initBanner () {
        var $container = $('.indexBanner')
        var defaultOptions = {
            container: '.indexBanner',
            nextButton: '.swiper-button-next',
            prevButton: '.swiper-button-prev',
            autoplay: 4000
        }
        var options
        if($container.find('.swiper-slide').length <= 10) { //小于10张图时用原点,否则用数字
            options = _.extend(defaultOptions, {
                pagination: '.bannerPagination',
                paginationClickable: '.bannerPagination'
            })
        }else {
            options = _.extend(defaultOptions, {
                pagination: '.bannerPagination',
                paginationBulletRender: function (index, className) {
                    return '<span class="' + className + ' number">' + (index + 1) + '/' + $container.find('.swiper-slide').length + '</span>';
                }
            })
        }
        window.bannerSwiper = new window.Swiper('.indexBanner', options)
    }
    initBanner()


    function initRoleChooserContent (tabName) {
           var windowHeight = $(window).height()
            var tabbarHeight = $('#roleChooser .tab_wrapper').height()

            if (tabName === 'landlord') {
                window.console.log('landlord')
                if (window.team.isCurrantClient()) {
                    var publishHeight = $('.publishInClient').height()
                    $('.publishInClient').css('margin-top', ((windowHeight - tabbarHeight - publishHeight) / 2) + 'px')
                }
                else  {
                    if (typeof window.indexAppDownloadSwiper === 'undefined') {
                        window.setupDownload(window.Swiper)
                    }
                }
            }
            else if (tabName === 'renter'){
                if (window.team.isCurrantClient()) {
                    var questionHeight = $('.renterService ul.questionChooser').height()
                    $('ul.questionChooser').css('margin-top', ((windowHeight - tabbarHeight - questionHeight)/ 2) + 'px')
                    $('.renterService').css('border-bottom', '0px');
                }
            }
    }

    function selectRoleChooserTab(tabName) {
        $('#roleChooser .tab [data-tab=' + tabName + ']').addClass('selectedTab')
        $('#roleChooser .content [data-tab-name=' + tabName + ']').addClass('selectedTab')
        $('#roleChooser .content [data-tab-name=' + tabName + ']').show()
    }
    if (window.user.user_type) {
        if (window.user.user_type[0].slug === 'investor') {
            selectRoleChooserTab('buyer')
            initRoleChooserContent('buyer')
        }
        else if (window.user.user_type[0].slug === 'landlord') {
            selectRoleChooserTab('landlord')
            initRoleChooserContent('landlord')

        }
        else if (window.user.user_type[0].slug === 'tenant') {
            selectRoleChooserTab('renter')
            initRoleChooserContent('renter')
        }
    }
    else {
        selectRoleChooserTab('buyer')
        initRoleChooserContent('buyer')
    }

    $('#roleChooser').tabs({trigger: 'click', autoSelectFirst: false}).on('openTab', function (event, target, tabName) {
        if ($(target).parents('[data-tabs]').first()[0] === $('#roleChooser')[0]) {
            window.scrollTo(0, $('#roleChooser').offset().top)
            initRoleChooserContent(tabName)
        }
    });

    $('.intentionChooser').tabs({trigger:'hover'}).on('openTab', function () {

    })


    $('#announcement').on('click', 'ul>li>.close', function (event) {
        var $item = $(event.target.parentNode)
        $item.remove()
        var $container = $(event.delegateTarget)
        if ($container.find('ul>li').length === 0) {
            $container.hide()
        }
    })

    function getSelectedBudgetTypeId() {
        var $selectedChild = $('#tags #budgetTag').children('.selected')
        if ($selectedChild.length) {
            return $selectedChild.first().attr('data-id')
        }
        return ''
    }

    // function getSelectedBudgetTypeValue() {
    //     var $selectedChild = $('#tags #budgetTag').children('.selected')
    //     if ($selectedChild.length) {
    //         return $selectedChild.first().text()
    //     }
    //     return ''
    // }

    function getSelectedIntentionIds() {
        var $selectedChildren = $('#tags #intentionTag ul').children('.selected')
        if ($selectedChildren.length) {
            var ids = ''
            _.each($selectedChildren, function (child) {
                ids += child.getAttribute('data-id')
                ids += ','
            })

            if (_.last(ids) === ',') {
                ids = ids.substring(0, ids.length - 1)
            }
            return ids
        }
        return ''
    }

    // function getSelectedIntentionValues() {
    //     var $selectedChildren = $('#tags #intentionTag ul').children('.selected')
    //     if ($selectedChildren.length) {
    //         var ids = ''
    //         _.each($selectedChildren, function (child) {
    //             ids += $(child).clone().children().remove().end().text()
    //             ids += ','
    //         })

    //         if (_.last(ids) === ',') {
    //             ids = ids.substring(0, ids.length - 1)
    //         }
    //         return ids
    //     }
    //     return ''
    // }

    function getAllIntentionIds() {
        var rawIntentionList = $('#dataIntentionList').text()
        var array = JSON.parse(rawIntentionList)
        if (array.length) {
            var ids = ''
            _.each(array, function (item) {
                ids += item.id
                ids += ','
            })

            if (_.last(ids) === ',') {
                ids = ids.substring(0, ids.length - 1)
            }

            return ids
        }
        return ''
    }

    function getIntentionById(id) {
        if (id) {
            var rawIntentionList = $('#dataIntentionList').text()
            var array = JSON.parse(rawIntentionList)
            var ret
            if (array.length) {
                _.each(array, function (item) {
                    if (item.id === id) {
                        ret = item
                    }
                })

            }
            return ret
        }
        return undefined
    }

    function getBudgetById(id) {
        if (id) {
            var rawBudgetList = $('#dataBudgetList').text()
            var array = JSON.parse(rawBudgetList)
            var ret
            if (array.length) {
                _.each(array, function (item) {
                    if (item.id === id) {
                        ret = item
                    }
                })

            }
            return ret
        }
        return undefined
    }

    function updatePropertyCards(array) {
        _.each(array, function (house) {

            var houseResult = {}
            if (house.isEmpty) {
                houseResult = _.template($('#empty_houseCard_template').html())({house: house})
                $('#suggestionHouses #list').append(houseResult)

            }
            else {
                houseResult = _.template($('#suggestion_houseCard_template').html())({house: house})
                $('#suggestionHouses #list').append(houseResult)
            }
        })
        updatePropertyCardMouseEnter()
    }

    function removePropertyCard(id) {
        $('#suggestionHouses #list .houseCard_wrapper[data-category-intention-id=' + id + ']').remove()
    }

    function updatePropertyCardMouseEnter() {
        $('.houseCard').mouseenter(function(event){
            $(event.delegateTarget).find('button.openRequirement').show()
        });

        $('.houseCard').mouseleave(function(event){
            $(event.delegateTarget).find('button.openRequirement').hide()
        });
    }


    function updateUserTags(budgetId, intentionIds) {

        var changed = false
        var oldBudgetId = ''
        if (window.budget) {
            oldBudgetId = window.budget.id
        }
        if (oldBudgetId !== budgetId) {
            changed = true
        }

        if (window.intention) {
            var oldIntentionArray = []
            _.each(window.intention, function (item) {
                oldIntentionArray.push(item.id)
            })
            var newIntentionArray = intentionIds.split(',')

            if (!_.isEmpty(_.difference(oldIntentionArray, newIntentionArray)) ||
                !_.isEmpty(_.difference(newIntentionArray, oldIntentionArray))) {
                changed = true
            }
        }

        if (!changed) {
            return;
        }

        var params = {}
        if (budgetId) {
            params.budget = budgetId
        }
        else {
            params.unset_fields = 'budget'
        }

        if (intentionIds) {
            params.intention = intentionIds
        }
        else {
            params.intention = ''
        }

        if (!_.isEmpty(params)) {
            $.betterPost('/api/1/user/edit', params)
                .done(function (data) {
                    window.user = data
                })
                .fail(function (ret) {
                })
                .always(function () {

                })
        }
    }

    function commaStringToArray(str) {
        var array = str.split(',')
        return _.without(array, '')
    }


    function loadIntentionDescription(callback) {
        $.betterPost('/api/1/enum?type=intention', {})
            .done(function (data) {
                window.intentionDescription = data
                callback()
            })
            .fail(function (ret) {
            })
            .always(function () {

            })
    }

    function updateIntentionDescription() {
        var callback = function () {
            var allTagDiv = $('.houseCard_wrapper .tagDetail')
            _.each(allTagDiv, function (tagDiv) {
                var intentionId = $(tagDiv).attr('data-intention-id')
                var description = ''
                _.each(window.intentionDescription, function (oneDes) {
                    if (oneDes.id === intentionId) {
                        description = oneDes.description
                    }
                })
                $(tagDiv).find('.description').text(description)
            })
        }

        if (window.intentionDescription) {
            callback()
        }
        else {
            loadIntentionDescription(callback)
        }
    }


    function loadPropertyListWithBudgetAndIntention(budgetType, intention) {

        $('#suggestionHouses #loadIndicator').show()

        var requestArray = []
        var responseArray = []

        var usedIntention = []
        var needShowSuggetionTip = false
        if (_.isEmpty(intention)) {
            usedIntention = commaStringToArray(getAllIntentionIds())
            needShowSuggetionTip = true
        }
        else {
            usedIntention = intention
        }

        var usedBudget = ''
        if (!budgetType) {
            usedBudget = '' //getLastBudgetTypeId()
        }
        else {
            usedBudget = budgetType
        }

        if (needShowSuggetionTip) {
            $('.tags_wrapper #intentionTag #suggestionTip').show()
        }
        else {
            $('.tags_wrapper #intentionTag #suggestionTip').hide()
        }

        _.each(usedIntention, function (oneIntention) {
            var params = {'random': true, 'intention': oneIntention}
            if (usedBudget) {
                params.budget = usedBudget
            }
            var apiCall = $.betterPost('/api/1/property/search', params)
                    .done(function (val) {
                        var array = val.content
                        var item = {}
                        if (!_.isEmpty(array)) {
                            item = _.first(array)
                            item.category_budget = getBudgetById(usedBudget)
                            item.category_intention = getIntentionById(oneIntention)
                            responseArray.push(item)
                        }
                        else {
                            item.isEmpty = true
                            if (usedBudget) {
                                item.category_budget = getBudgetById(usedBudget)
                            }
                            if (oneIntention) {
                                item.category_intention = getIntentionById(oneIntention)
                            }
                            responseArray.push(item)
                        }
                    })
                    .fail(function (ret) {

                    })

            requestArray.push(apiCall)
        })

        $.when.apply($, requestArray)
            .done(function () {
                updatePropertyCards(responseArray)
                updateIntentionDescription()
                $('#suggestionHouses #loadIndicator').hide()
            })
            .fail(function () {
                updatePropertyCards(responseArray)
                updateIntentionDescription()
                $('#suggestionHouses #loadIndicator').hide()
            })
            .always(function () {

            })
    }

    function loadPropertyList(budgetType, intention) {
        if (window.project.currentBudgetId !== budgetType) {
            //load all
            $('#suggestionHouses #list').empty()
            loadPropertyListWithBudgetAndIntention(budgetType, commaStringToArray(intention))
        }
        else {
            //compare intention list
            var newIntentionArray = commaStringToArray(intention)
            var currentIntentionArray = commaStringToArray(window.project.currentIntentionIds)

            var newAddIntentionArray = _.difference(newIntentionArray, currentIntentionArray)
            var deleteIntentionArray = _.difference(currentIntentionArray, newIntentionArray)

            if (_.isEmpty(newAddIntentionArray) && !_.isEmpty(deleteIntentionArray)) {
                // remove data
                _.each(deleteIntentionArray, function (item) {
                    removePropertyCard(item)
                })

                //if remove all intention restore back to all intention
                if ($('#suggestionHouses').find('#list').children().length === 0)  {
                    loadPropertyListWithBudgetAndIntention(budgetType, '')
                }
            }
            else if (!_.isEmpty(newAddIntentionArray) && _.isEmpty(deleteIntentionArray)) {

                //if the result is from suggestion, when user have new newAddIntentionArray, remove them
                if (currentIntentionArray.length === 0) {
                    $('#suggestionHouses #list').empty()
                }
                //append data
                loadPropertyListWithBudgetAndIntention(budgetType, newAddIntentionArray)
            }
            else {
                //load all
                $('#suggestionHouses #list').empty()
                loadPropertyListWithBudgetAndIntention(budgetType, commaStringToArray(intention))
            }
        }

        window.project.currentBudgetId = budgetType
        window.project.currentIntentionIds = intention

        updateUserTags(window.project.currentBudgetId, window.project.currentIntentionIds)
    }

    function addIntetionTag(id, value) {
        var $intentionTag = $('#tags #intentionTag')
        $intentionTag.find('#list').append('<li class="toggleTag selected" data-id="' + id + '">' +
                                           value +
                                           '<img alt="" src="/static/images/intention/close.png"/></li>'
                                          )
    }

    function removeIntentionTag(id) {
        var $intentionTag = $('#tags #intentionTag')
        $intentionTag.find('#list li[data-id=' + id + ']').remove()
    }

    function getIntentionTabsHeight() {
        if (window.team.isPhone()) {
            return 80 + Math.ceil($('.intention .controls').children().length / 3.0) * 140  + 18 + 15
        }
        else {
            return 530
        }
    }

    function setupUserPropertyChooser() {
        $('.intentionChooser').tabs({trigger: 'hover'})
        var $intentionDetails = $('.intentionChooser')

        var $budgetTag = $('#tags #budgetTag')
        var $intentionTag = $('#tags #intentionTag')

        var initBudgetId = ''
        var initIntentionList = ''
        if (window.user.budget) {
            $budgetTag.find('.toggleTag[data-id=' + window.user.budget.id + ']').addClass('selected')
            initBudgetId = window.user.budget.id
        }

        if (window.user.intention) {
            _.each(window.user.intention, function (item) {
                if (item.value && item.slug) {
                    addIntetionTag(item.id, item.value)
                    $intentionDetails.find('li[data-id=' + item.id + ']').addClass('selected')
                    $intentionDetails.find('input[value=' + item.id + ']').prop('checked', true)
                    initIntentionList = initIntentionList + item.id + ','
                }
            })

            if (_.last(initIntentionList) === ',') {
                initIntentionList = initIntentionList.substring(0, initIntentionList.length - 1)
            }
        }


        loadPropertyList(initBudgetId, initIntentionList)

        //if user don't choose one intention, show the tabs
        if (!commaStringToArray(initIntentionList).length) {
            $('.intentionTabs_wrapper').animate({height: getIntentionTabsHeight() + 'px'}, 400, 'swing')
        }

        $budgetTag.on('click', '.toggleTag', function (event) {

            var $item = $(event.target)
            var alreadySelected = $item.hasClass('selected')
            var $parent = $(event.target.parentNode)
            $parent.find('.toggleTag').removeClass('selected')

            if (!alreadySelected) {
                $item.addClass('selected')
            }

            loadPropertyList(getSelectedBudgetTypeId(), getSelectedIntentionIds())

            ga('send', 'event', 'index', 'change', 'change-budget',$item.text())
        })

        $intentionTag.on('click', '.toggleTag img', function (event) {

            var $li = $(event.target).parent()
            var id = $li.attr('data-id')
            $intentionDetails.find('li[data-id=' + id + ']').removeClass('selected')
            $intentionDetails.find('input[value=' + id + ']').prop('checked', false)
            $li.remove()
            loadPropertyList(getSelectedBudgetTypeId(), getSelectedIntentionIds())

            ga('send', 'event', 'index', 'change', 'remove-intention-on-tag',$li.text())
        })

        $intentionDetails.find('[name=intention]').on('change', function () {
            var $li = $(this).closest('li')

            $li.toggleClass('selected', this.checked)

            if (this.checked) {
                addIntetionTag($li.attr('data-id'), $li.attr('data-value'))
                ga('send', 'event', 'index', 'change', 'add-intention',$li.text())
            }
            else {
                removeIntentionTag($li.attr('data-id'))
                ga('send', 'event', 'index', 'change', 'remove-intention-on-icon',$li.text())
            }
            loadPropertyList(getSelectedBudgetTypeId(), getSelectedIntentionIds())
        })

        $intentionTag.find('#add').click(function () {
            $('html, body').animate({scrollTop: $('.intentionTabs_wrapper').offset().top - 60 }, 'fast')
            $('.intentionTabs_wrapper').animate({height: getIntentionTabsHeight() + 'px'}, 400, 'swing')

            ga('send', 'event', 'index', 'click', 'extend-intention-selection')
        })

        $('.intentionTabs_wrapper').find('#collapseButton').click(function () {
            $('.intentionTabs_wrapper').animate({height: '0'}, 400, 'swing')

            ga('send', 'event', 'index', 'click', 'collapse-intention-selection')
        })
    }

    if (window.user) {
        setupUserPropertyChooser()
    }
    else {
        $('.intentionChooser').tabs({trigger: 'hover'})
        updatePropertyCardMouseEnter()
    }

    //GA Event - Home Slideshow
    $('.gallery .rslides').find( 'li' ).find('.button').click(function(e){
        ga('send', 'event', 'index', 'click', 'slideshow-button',$(e.currentTarget).text())
    })

    //GA Event - Feature Property
    $('.houseFeatured .houseCard .otherAction .openRequirement').click(function(e){
        //Send pure property title to GA
        ga('send', 'event', 'index', 'click', 'open-feature-requirementpopup',$(e.currentTarget).parent().parent().find('.name a').text().replace(/ /g,'').replace(/(\r\n|\n|\r)/gm,''))
    })

    $('.houseFeatured .houseCard .relatedNews .list a').click(function(e){
        ga('send', 'event', 'index', 'click', 'click-related-news',$(e.currentTarget).text())
    })

    $('.houseFeatured .houseCard_phone_new .relatedNews .list a').click(function(e){
        ga('send', 'event', 'index', 'click', 'click-related-news',$(e.currentTarget).text())
    })

    //GA Event - Recommended Property
    //TODO Only this one Not working on debug mode
    $('.suggestionHouses .houseCard .otherAction .openRequirement').click(function(e){
        //Send pure property title to GA
        ga('send', 'event', 'index', 'click', 'open-recommended-requirementpopup',$(e.currentTarget).parent().parent().find('.name a').text().replace(/ /g,'').replace(/(\r\n|\n|\r)/gm,''))
    })
})()
