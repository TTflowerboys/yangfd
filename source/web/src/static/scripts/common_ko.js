
(function (ko, module) {
    ko.bindingHandlers.chosen = {
        init: function(element, valueAccessor, allBindings)  {
            ko.bindingHandlers.options.init.call(this, element)
            $(element)[window.team.isPhone() ? 'chosenPhone' : 'chosen']({disable_search_threshold: 10, inherit_select_classes: true, disable_search: true, width: $(element).css('width')})
            if(allBindings().value && _.isFunction(allBindings().value.subscribe)) {
                allBindings().value.subscribe(function (val) {
                    if(!_.isObject(val)) {
                        $(element).val(val)
                    }
                    setTimeout(function () {
                        $(element).trigger('chosen:updated')
                    }, 100)
                })
            }
        },
        update: function(element, valueAccessor, allBindings) {
            ko.bindingHandlers.options.update.call(this, element, valueAccessor, allBindings)
            //如果直接触发chosen:updated，在更改time后再更改mode，chosen的更新有问题
            setTimeout(function () {
                $(element).trigger('chosen:updated')
            }, 100)
        }
    }

    ko.bindingHandlers.initializeValue = {
        init: function(element, valueAccessor) {
            if (element.getAttribute('value')) {
                valueAccessor()(element.getAttribute('value'));
            } else if (element.tagName === 'SELECT') {
                valueAccessor()(element.options[element.selectedIndex].value);
            }
        },
        update: function(element, valueAccessor) {
            var value = valueAccessor();
            element.setAttribute('value', ko.utils.unwrapObservable(value));
        }
    }

    ko.components.register('tags', {
        viewModel: function(params) {
            this.list = ko.observableArray(params.list())
            this.key = params.key
            this.choose = function (data, event) {
                this[params.key](data.id)
                $(event.target).parents('tags').trigger('change')
            }
        },
        template: '<div data-bind="foreach: list"><span class="property_type" data-bind="text: value, click: $parent.choose.bind($parents[$parents.length - 2]), css: {selected: id === $parents[$parents.length - 2][$parent.key]()}"></span></div>'
    })

    ko.bindingHandlers.dateRangePicker = {
        init: function(element, valueAccessor)  {
            $(element).find('input').dateRangePicker({
                autoClose: true,
                singleDate: true,
                showShortcuts: false,
                lookBehind: false,
                getValue: function() {
                    return valueAccessor()() ? valueAccessor()() : ''
                }
            })
                .bind('datepicker-change', function (event, obj) {
                    valueAccessor()($.format.date(new Date(obj.date1), 'yyyy-MM-dd'))
                    $(event.target).trigger('change')
                })
                .dateRangePickerCustom($(element).find('input'))
        }
    }
    ko.bindingHandlers.dateInput = {
        init: function(element, valueAccessor)  {
            if($(element).is('input')) {
                $(element).on('touchstart', function () {
                    this.type = 'date'
                    $(this).focus()
                })
                $(element).on('blur', function () {
                    if(this.value === '') {
                        this.type = 'text'
                    }
                })
            }
        }
    }

    ko.bindingHandlers.hoverTopBar = {
        init: function(element, valueAccessor)  {
            var phoneOnly = valueAccessor() || false
            var originDisplay = $(element).css('display')
            var offsetTop = $(element).offset().top
            if(!phoneOnly || (phoneOnly && window.team.isPhone())) {
                $(window).on('scroll', function () {
                    if($(window).scrollTop() >= offsetTop) {
                        $(element).css({
                            position: 'fixed',
                            top: 0,
                            zIndex: 10000
                        })
                    } else {
                        $(element).css({
                            position: originDisplay,
                            top: '',
                            zIndex: ''
                        })
                    }

                })
            }
        }
    }

    ko.components.register('tips', {
        viewModel: function(params) {
            this.tips = ko.observable(params.tips)
            this.visible = ko.observable(false)
            this.showTips = function (data, event) {
                if(!window.team.isPhone()) {
                    this.visible(true)
                }
            }
            this.hideTips = function () {
                if(!window.team.isPhone()) {
                    this.visible(false)
                }
            }
            this.toggleTips = function () {
                this.visible(!this.visible())
            }
        },
        template: '<div class="tipsWrap" data-bind="event: {mouseover: showTips, mouseout: hideTips, click: toggleTips}"><i class="questionMark">?</i><div class="tips" data-bind="text: tips, visible: visible"></div></div>'
    })
    ko.bindingHandlers.scrollTop = {
        update: function (element, valueAccessor) {
            var value = ko.utils.unwrapObservable(valueAccessor())
            if (value) {
                $(element).scrollTop(value)
            }
        }
    }

    ko.bindingHandlers.highlight = {
        update: function (element, valueAccessor) {
            if(valueAccessor().text) {
                $(element).html(valueAccessor().text.replace(new RegExp(valueAccessor().highlight(), 'gi'), function(match){return '<strong>' + match + '</strong>'}))
            }
        }
    }

    ko.components.register('location-search-box', {
        viewModel: function(params) {
            this.parentVM = params.parentVM
            this.hotCityList = ko.observableArray(params.hotCityList)
            this.hotSchoolList = ko.observableArray(params.hotSchoolList)
            this.active = ko.observable() //输入框是否为激活状态，激活状态
            this.query = ko.observable(params.parentVM.query() || window.team.getQuery('queryName')) //输入框的结果
            this.lastSearchText = ko.observable(params.parentVM.query() || window.team.getQuery('queryName')) //输入框的结果
            //this.query.subscribe(function (value) {
            //    this.parentVM.queryTemp(value)
            //}, this)
            this.suggestions = ko.observableArray() //搜索结果列表
            this.activeSuggestionIndex = ko.observable(-1) //选中状态的结果的index
            this.hint = ko.observable() //提示文字

            this.scrollTop = ko.computed(function () {
                return 38 * (this.activeSuggestionIndex() + 1) - 298
            }, this)

            this.blur = function () {
                setTimeout(_.bind(function () {
                    this.active(false)
                }, this), 150)
            }

            this.focus = function () {
                this.active(true)
                if(this.query()) {
                    this.search()
                }
            }

            this.search = _.bind(function () {
                this.activeSuggestionIndex(-1)
                var name = this.query()
                this.lastSearchText(name)
                this.active(true)
                if (name === undefined || !name.length) {
                    this.hint('')
                    this.suggestions([])
                } else {
                    if(!this.suggestions().length) {
                        this.hint(window.i18n('载入中...'))
                    }
                    window.geonamesApi.mixedIndexSearch({suggestion: name}).
                        then(_.bind(function (resultsOfMixedSearch) {
                            var suggestions = resultsOfMixedSearch
                            if(suggestions.length) {
                                this.hint('')
                            } else {
                                this.hint('')
                            }
                            suggestions = _.map(suggestions, function (item) {
                                var intersection = _.intersection(module.suggestionTypeSlugList, _.keys(item))
                                if(intersection.length) {
                                    item.type = _.find(module.suggestionTypeList, {slug: intersection[0]})
                                }
                                return item
                            })
                            this.suggestions(suggestions)
                        }, this))
                }
            }, this)

            this.getSuggestions = function () {
                this.search()
            }

            this.downward = function () {
                var len = this.suggestions().length
                var originActiveSuggestionIndex = this.activeSuggestionIndex()
                if(len && originActiveSuggestionIndex < len - 1) {
                    this.activeSuggestionIndex(originActiveSuggestionIndex + 1)
                }
            }

            this.upward = function () {
                var len = this.suggestions().length
                var originActiveSuggestionIndex = this.activeSuggestionIndex()
                if(len && originActiveSuggestionIndex > 0) {
                    this.activeSuggestionIndex(originActiveSuggestionIndex - 1)
                }
            }

            this.keyUp = function (viewModel, e) {
                if(this.query() !== this.lastSearchText()) {
                    this.parentVM.clearSuggestionParams.call(this.parentVM)
                    return this.search()
                }
                if(!window.team.isPhone()) {
                    switch(e.keyCode) {
                        case 13: //enter
                            if(this.parentVM.queryName && this.parentVM.queryName()) {
                                return this.blur()
                            }
                            if(this.activeSuggestionIndex() === -1) {
                                this.blur()
                                this.searchTicket()
                            } else {
                                this.select(this.suggestions()[this.activeSuggestionIndex()])
                            }
                            break;
                        case 40: //⬇️
                            e.preventDefault()
                            this.downward()
                            break;
                        case 38: //⬆️
                            e.preventDefault()
                            this.upward()
                            break;
                    }
                }
            }

            this.select = _.bind(function (item) {
                this.activeSuggestionIndex(-1)
                this.query(item.name)
                this.lastSearchText(item.name)
                this.active(false)
                this.hideSearchModal()
                this.searchBySuggestion(item)
            }, this)

            this.searchBySuggestion = function (item) {
                var param = {}
                _.each(module.suggestionTypeSlugList, function (slug) {
                    if(item[slug]) {
                        param[slug] = item[slug]
                        param.queryName = item.name
                    }
                })
                this.parentVM.searchBySuggestion.call(this.parentVM, param)
            }

            //for mobile
            this.isModalShow = ko.observable()
            this.inputFocus = ko.observable()

            this.showSearchModal = function () {
                module.appViewModel.popupActive(true)
                this.isModalShow(true)
                this.inputFocus(true)
                this.search()
            }

            if(location.href.indexOf('showSearchModal=true') > 0) {
                this.showSearchModal()
            }

            this.hideSearchModal = function () {
                module.appViewModel.popupActive(false)
                this.isModalShow(false)
                this.inputFocus(false)
            }

            this.hideKeyboard = function () {
                this.inputFocus(false)
                return true
            }
            this.clear = function () {
                this.query('')
                this.parentVM.clearSuggestionParams.call(this.parentVM)
            }

            this.searchTicket = function () {
                this.parentVM.clearSuggestionParams.call(this.parentVM)
                this.hideSearchModal()
                this.parentVM.searchTicket.call(this.parentVM, this.query() || '')
            }

            $('location-search-box').on('searchTicket', _.bind(function () {
                this.searchTicket()
            }, this))
        },
        template: { element: window.team.isPhone() ? 'location-search-box-mobile' : 'location-search-box' }
    })


    module.AppViewModel = function AppViewModel() {
        this.popupActive = ko.observable()
    }
    module.appViewModel = new module.AppViewModel()
    $(function () {
        ko.applyBindings(module.appViewModel)
    })
    $('body').on('touchmove', function (e) {
        //当手机上有弹出层时，禁止body滚动
        if(module.appViewModel.popupActive()) {
            e.stopImmediatePropagation()
        }
    })

    window.project.getEnum('featured_facility_type')
        .then(function (val) {
            module.suggestionTypeList = val
            module.suggestionTypeSlugList = _.map(val, function (item) {
                return item.slug
            })
        })

})(window.ko, window.currantModule = window.currantModule || {})