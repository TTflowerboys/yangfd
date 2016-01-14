(function (ko, module) {
    var itemsPerPage = 5
    var lastItemTime
    var isLoading = false
    var isAllItemsLoaded = false
    var mode = window.team.getQuery('mode', window.location.href)?  window.team.getQuery('mode', window.location.href): 'list'

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
                        lastItemTime = _.last(array).sort_time
                        window.rentList = array
                        _.each(array, function (rent) {
                            if(rent && rent.property){
                                rent = filterObjectProperty(rent)
                                var houseResult = _.template($('#rentCard_template').html())({rent: rent})
                                resultHtml += houseResult

                                if (lastItemTime > rent.sort_time) {
                                    lastItemTime = rent.sort_time
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
        var rentPeriodStartDate = module.appViewModel.rentListViewModel.rentAvailableTimeFormated()
        var rentPeriodEndDate = module.appViewModel.rentListViewModel.rentDeadlineTimeFormated()
        if (rentBudgetMin.length && rentBudgetMax.length && parseInt(rentBudgetMin) >= parseInt(rentBudgetMax)) {
            window.dhtmlx.message({ type:'error', text: i18n('租金下限必须小于租金上限')});
            return false
        }
        if (rentPeriodStartDate && rentPeriodEndDate && rentPeriodStartDate.length && rentPeriodEndDate.length && window.moment(rentPeriodStartDate) >= window.moment(rentPeriodEndDate)) {
            window.dhtmlx.message({ type:'error', text: i18n('租期开始日期必须早于租期结束日期')});
            return false
        }
        return true

    }
    window.getBaseRequestParams = function () {
        return _.omit(module.appViewModel.rentListViewModel.params(), function (val) {
            return val === '' || val === undefined
        });
    }

     //used in mobile client
    window.getSummaryTitle = function () {
        return _.compact(_.values(module.appViewModel.rentListViewModel.summaryTitleObj())).join(', ')
    }

    //check showTags at first time in mobile
    if (window.team.isPhone()) {
        var tagQueries = ['property_type', 'rent_type', 'rent_period', 'bedroom_count', 'space']
        var tagQuery = _.find(tagQueries, function(key){ return window.team.getQuery(key, location.href) !== ''})
        if (tagQuery) {
            showTagsOnMobile()
        }
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
            params.sort_time = lastItemTime
            //Load more triggered
            ga('send', 'event', 'rent_list', 'trigger', 'load-more')
        }

        if(reload){
            $('#result_list').empty()
            lastItemTime = null
            delete params.sort_time
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
                initIntro()
                var array = val
                if (!_.isEmpty(array)) {
                    lastItemTime = _.last(array).sort_time

                    if (!window.rentList) {
                        window.rentList = []
                    }
                    window.rentList = window.rentList.concat(array)

                    _.each(array, function (rent) {
                        rent = filterObjectProperty(rent)
                        var houseResult = _.template($('#rentCard_template').html())({rent: rent})
                        $('#result_list').append(houseResult)

                        if (lastItemTime > rent.sort_time) {
                            lastItemTime = rent.sort_time
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
                        window.dhtmlx.message({ type:'error', text: window.i18n('地图加载失败') })
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
    module.loadRentListByView = loadRentListByView

    function updateURLQuery(key, value) {
        var oldUrl = location.href
        var newUrl = oldUrl
        var params = _.mapObject(module.appViewModel.rentListViewModel.params(), function (val, key) {
            if(key.indexOf('rent_budget') === 0 && val) {
                return _.values(JSON.parse(val)).reverse().join(':')
            } else {
                return val
            }
        })
        _.forEach(_.pairs(params), function (item) {
            if (item[1]) {
                newUrl = window.team.setQuery(item[0], item[1], newUrl)
            } else {
                newUrl = window.team.setQuery(item[0], '', newUrl)
            }
        })
        if(key && value) {
            newUrl = window.team.setQuery(key, value, newUrl)
        }
        if(newUrl !== oldUrl) {
            history.pushState({}, null, newUrl)
        }
    }

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
            $button.find('label').text(window.i18n('高级筛选'))
            $button.find('img').removeClass('rotated')
            $button.attr('data-state', 'closed')
        }
    }

    $('#showTags').click(function (event) {
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

    function loadRentMapList() {
        $('.emptyPlaceHolder').hide();
        if(!checkValidOfRequestParams()) {
            return
        }
        if (window.betterAjaxXhr && window.betterAjaxXhr['/api/1/rent_ticket/search'] && window.betterAjaxXhr['/api/1/rent_ticket/search'].readyState !== 4) {
            window.betterAjaxXhr['/api/1/rent_ticket/search'].abort()
        }
        var params = _.extend(window.getBaseRequestParams(), {'location_only': 1})

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
                    window.dhtmlx.message({ type:'error', text: window.i18n('暂无结果') })
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

    $(window).scroll(window.updateTabSelectorFixed);
    $(window).resize(window.updateTabSelectorFixed);


    function initIntro() {
        if($.cookie('introjs_rent_list') !== 'hasShow') {
            $.cookie('introjs_rent_list', 'hasShow', {
                path: '/',
                expires: new Date(new Date().getTime() + 1000 * 60 * 60 * 24 * 365)
            })
            var options = {
                targetElem: window.team.isPhone() ? $('.tabSelector_phone .icon-map_view') : $('.tabSelector .map'),
                text: i18n('点击在地图里查看这些房源'),
                arrow: 'left',
                closeTrigger: {
                    elem: '.icon-map_view',
                    event: 'click'
                }
            }
            if($(window).width() < 1690 && !window.team.isPhone()) {
                options.arrow = 'right'
            }
            new window.currantModule.IntroLite().init(options)
        }
    }

    function RentListViewModel() {
        this.rentAvailableTimeFormated = ko.observable()
        this.rentAvailableTime = ko.computed(function () {
            return this.rentAvailableTimeFormated() ? new Date(this.rentAvailableTimeFormated()).getTime() / 1000 : ''
        }, this)

        this.rentDeadlineTimeFormated = ko.observable()
        this.rentDeadlineTime = ko.computed(function () {
            return this.rentDeadlineTimeFormated() ? new Date(this.rentDeadlineTimeFormated()).getTime() / 1000: ''
        }, this)

        this.clearDate = function (key) {
            return _.bind(function () {
                this[key]('')
            }, this)
        }

        this.rentType = ko.observable()
        this.rentBudgetMin = ko.observable()
        this.rentBudgetMax = ko.observable()
        this.propertyType = ko.observable()
        this.bedroomCount = ko.observable()
        this.space = ko.observable()
        this.query = ko.observable()
        this.hesaUniversity = ko.observable()
        this.doogalStation = ko.observable()
        this.maponicsNeighborhood = ko.observable()

        function transferBudget(text) {
            return text ? JSON.stringify({
                unit: text.split(':')[1],
                value: text.split(':')[0]
            }) : ''
        }
        this.params = ko.computed(function () {
            return {
                query: this.query(),
                rent_available_time: this.rentAvailableTime(),
                rent_deadline_time: this.rentDeadlineTime(),
                rent_type: this.rentType(),
                rent_budget_min: transferBudget(this.rentBudgetMin()),
                rent_budget_max: transferBudget(this.rentBudgetMax()),
                property_type: this.propertyType(),
                bedroom_count: this.bedroomCount(),
                space: this.space(),
                hesa_university: this.hesaUniversity(),
                doogal_station: this.doogalStation(),
                maponics_neighborhood: this.maponicsNeighborhood()
            }
        }, this)
        this.paramsToWrite = ko.computed({
            read: this.params,
            write: function (value) {
                var whiteList = ['rent_available_time', 'rent_deadline_time', 'rent_type', 'rent_budget_min', 'rent_budget_max', 'property_type', 'bedroom_count', 'space', 'query'].concat(module.suggestionTypeSlugList)
                var suggestionParams = {}
                _.each(module.suggestionTypeSlugList, function (slug) {
                    suggestionParams[slug] = ''
                })
                var pureValue = _.extend(suggestionParams, _.pick(value, whiteList))
                _.each(_.keys(pureValue), _.bind(function (key) {
                    if(!_.contains(['rent_available_time', 'rent_deadline_time'], key)) {
                        this[window.project.underscoreToCamel(key)](decodeURIComponent(pureValue[key]))
                    } else {
                        this[window.project.underscoreToCamel(key) + 'Formated']($.format.date(new Date(parseInt(pureValue[key]) * 1000), 'yyyy-MM-dd'))
                    }
                }, this))
            }
        }, this)

        //合并短时间内对同一函数的多次调用
        var mergeInvoke = (function () {
            var memory = {}
            return function (key, callback, interval) {
                var time = new Date().getTime()
                if(!memory[key]) {
                    memory[key] = {
                        callback: callback,
                        time: time,
                        interval: interval,
                        timer: setTimeout(function () {
                            mergeInvoke.call(null, key, callback, interval)
                        }, interval)
                    }
                } else {
                    clearTimeout(memory[key].timer)
                    if(time - memory[key].time < interval) {
                        _.extend(memory[key], {
                            time: time,
                            timer: setTimeout(function () {
                                mergeInvoke.call(null, key, callback, interval)
                            }, interval)
                        })
                    } else {
                        callback.call(null)
                        delete memory[key]
                    }
                }
            }
        })()

        window.project.getEnum('featured_facility_type')
            .then(_.bind(function (val) {
                module.suggestionTypeList = val
                module.suggestionTypeSlugList = _.map(val, function (item) {
                    return item.slug
                })
                this.params.subscribe(function(params) {
                    mergeInvoke('loadRentListByView', function () {
                        updateURLQuery()
                        module.loadRentListByView()
                    }, 200)
                }, this)
                this.paramsToWrite(window.project.getParams())

            }, this))


        this.summaryTitleObj = ko.observable({})

        this.searchTicketClick = function () {
            $('location-search-box').trigger('searchTicket')
        }
        this.searchTicket = function (query) {
            this.query(query)
            //module.loadRentListByView()
        }

        this.searchBySuggestion = function (param) {
            this.query('')
            this.paramsToWrite(param)
            //module.loadRentListByView()
        }
        this.clearSuggestionParams = function () {
            this.query('')
            this.paramsToWrite({})
        }
    }
    module.appViewModel.rentListViewModel = new RentListViewModel()

    $('[data-tabs]').tabs({trigger: 'click'}).on('openTab', function (event, target, tabName) {
        mode = tabName
        loadRentListByView()
        ga('send', 'event', 'rent_list', 'click', mode + '-view', 'pc')
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
        ga('send', 'event', 'rent_list', 'click', mode + '-view', 'mobile')
    })
})(window.ko, window.currantModule = window.currantModule || {})
