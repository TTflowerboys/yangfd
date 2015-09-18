(function () {

    /*
     Bridge Life Cycle Sample Code
     window.onunload = function() {

     }

     document.addEventListener('bridgeready', onBridgeReady, false);
     function onBridgeReady() {
     window.alert('view bridgeready')
     }

     document.addEventListener('viewreappear', onViewReappear, false);

     function onViewReappear() {
     window.alert('view reappear')
     }

     document.addEventListener('viewdisappear', onViewDisappear, false);

     function onViewDisappear() {
     window.alert('view disappear')
     }
     */

    $.propertyGet = function (url, params) {
        var deferred = $.Deferred()
        var cacheResult = getPropertyXhrCache(url, params)
        if (cacheResult) {
            deferred.resolve(cacheResult)
        }
        else {
            var xhr = $.get(url, params).done(function (data, textStatus, jqXHR) {
                if (data.ret !== undefined) {
                    if (data.ret === 0) {
                        deferred.resolve(data.val)
                        savePropertyXhrCache(url, params, data.val)
                    } else {
                        deferred.reject(data.ret)
                    }
                } else {
                    deferred.resolve(data, textStatus, jqXHR)
                }
            }).fail(function (jqXHR, textStatus, errorThrown) {
                deferred.reject(jqXHR.status)
            }).always(function() {

            })

            if (!window.requestXhrArray) {
                window.requestXhrArray = []
            }
            window.requestXhrArray.push(xhr)
        }
        return deferred.promise()
    }

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
        if($container.find('.swiper-slide').length > 1){
            window.bannerSwiper = new window.Swiper('.indexBanner', options)
        }
    }
    initBanner()


    function initRoleChooserContent (tabName) {
        var windowHeight = $(window).height()
        var tabbarHeight = $('#roleChooser .tab_wrapper').height()

        if (tabName === 'buyer') {
            $('.intentionChooser').tabs({trigger:'hover'}).on('openTab', function () {

            })
            if (window.user) {
                window.currantModule.setupUserPropertyChooser(loadPropertyList)
            }
            else {
                $('.intentionChooser').tabs({trigger: 'hover'})
            }
        }
        else if (tabName === 'landlord') {
            window.console.log('landlord')
            if (window.team.isCurrantClient()) {
                var publishHeight = $('.publishInClient').height()
                $('.publishInClient').css('margin-top', ((windowHeight - tabbarHeight - publishHeight) / 2) + 'px')
            }
            else if (window.team.isPhone() && !window.team.isWeChat()) {
                window.team.initDisplayOfElement()
            }
            else  {
                window.team.initDisplayOfElement()
                $('.downloadWrap a.web').hide()
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


    $('#roleChooser').tabs({trigger: 'click', autoSelectFirst: false}).on('openTab', function (event, target, tabName) {
        if ($(target).parents('[data-tabs]').first()[0] === $('#roleChooser')[0]) {
            window.scrollTo(0, $('#roleChooser').offset().top)
            initRoleChooserContent(tabName)
        }
    });

    if(window.team.getQuery('_i18n') === 'en_GB') {
        selectRoleChooserTab('landlord')
        initRoleChooserContent('landlord')
    } else {
        if (window.user && window.user.user_type) {
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
    }



    $('#announcement').on('click', 'ul>li>.close', function (event) {
        var $item = $(event.target.parentNode)
        $item.remove()
        var $container = $(event.delegateTarget)
        if ($container.find('ul>li').length === 0) {
            $container.hide()
        }
    })



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
                $('#suggestionHouses .list').append(houseResult)

            }
            else {
                houseResult = _.template($('#suggestion_houseCard_template').html())({house: house})
                $('#suggestionHouses .list').append(houseResult)
            }
        })
        updatePropertyCardMouseEnter()
    }

    // function removePropertyCard(id) {
    //     $('#suggestionHouses .list .houseCard_wrapper[data-category-intention-id=' + id + ']').remove()
    // }

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
            if (window.betterAjaxXhr && window.betterAjaxXhr['/api/1/user/edit'] && window.betterAjaxXhr['/api/1/user/edit'].readyState !== 4) {
                window.betterAjaxXhr['/api/1/user/edit'].abort()
            }
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

    function getPropertyXhrKey(url, params) {
        var str = JSON.stringify(params)
        return url + str
    }

    function savePropertyXhrCache(url, params, result) {
        var key = getPropertyXhrKey(url, params)
        if (!window.propertyXhrCache) {
            window.propertyXhrCache = {}
        }
        window.propertyXhrCache[key] = result
    }

    function getPropertyXhrCache(url ,params) {
        var key = getPropertyXhrKey(url, params)
        if (!window.propertyXhrCache) {
            return null
        }
        else {
            return window.propertyXhrCache[key]
        }
    }

    function cancelLoadPropertyList() {
        _.each(window.requestXhrArray, function (xhr) {
            if (xhr && xhr.readyState !== 4) {
                xhr.abort()
            }
        })
        window.requestXhrArray = []
    }


    function loadPropertyListWithBudgetAndIntention(budgetType, intention) {

        $('#suggestionHouses #loadIndicator').show()

        var requestArray = []
        var responseArray = []

        var usedIntention = []
        if (_.isEmpty(intention)) {
            usedIntention = commaStringToArray(getAllIntentionIds())
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


        _.each(usedIntention, function (oneIntention) {
            var params = {'random': true, 'intention': oneIntention, 'per_page':5}
            if (usedBudget) {
                params.budget = usedBudget
            }
            var apiCall = $.propertyGet('/api/1/property/search', params)
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
        cancelLoadPropertyList()
        $('#suggestionHouses .list').empty()
        loadPropertyListWithBudgetAndIntention(budgetType, commaStringToArray(intention))
        window.project.currentBudgetId = budgetType
        window.project.currentIntentionIds = intention
        updateUserTags(window.project.currentBudgetId, window.project.currentIntentionIds)
    }

    if (!window.user) {
        updatePropertyCardMouseEnter()
    }
    $('.publishInClient .scrollDown').on('click', function (e) {
        var top = $('.delegationRent .title').offset().top
        $('body,html').stop(true,true).animate({scrollTop: top}, 300);
    })

    $('#delegateRentButton').on('click', function () {
        window.currantModule.openDelegateRent()
    })
    $('#delegateSaleButton').on('click', function () {
        window.currantModule.openDelegateSale()
    })
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
    function initDownloadWrap () {
        var $downloadWrap = $('.landlordService>.appDownload')
        if(!$downloadWrap.length) {
            return
        }
        if(window.team.isPhone()) {
            if($downloadWrap.data('status') !== 'phone') {
                $downloadWrap.data('status', 'phone')
                $downloadWrap.find('.wrapCenter').appendTo($downloadWrap)
            }
        } else {
            if($downloadWrap.data('status') !== 'pc') {
                $downloadWrap.data('status', 'pc')
                $downloadWrap.find('.wrapCenter').insertBefore($downloadWrap.find('.wrapLeft'))
            }
        }
    }
    initDownloadWrap()
    $(window).resize(function () {
        initDownloadWrap()
    })
})()
