(function (ko, module) {
    module.suggestionTypeList = ['hesa_university', 'doogal_station', 'maponics_neighborhood']

    ko.components.register('filter-tags', {
        viewModel: function (params) {
            this.parentVM = params.vm
            if(!this.parentVM[params.key]) {
                this.parentVM[params.key] = ko.observable()
            }
            this.list = ko.observableArray(_.isFunction(params.list) ? params.list() : params.list)
            this.key = params.key

            this.choose = function (data, event) {
                if (this[params.key]() === data.id) {
                    this[params.key]('')
                } else {
                    this[params.key](data.id)
                }
                /*if (params.gaConfig) {
                    ga('send', 'event', params.gaConfig.ec, params.gaConfig.ea, params.gaConfig.el, data[params.gaConfig.ev])
                }*/
                setTimeout(function () {
                    $(event.target).parents('filter-tags').trigger('change')
                })
            }
            return this
        },
        template: '<div data-bind="foreach: list"><div class="toggleTag noBorder" data-bind="text: value, click: $parent.choose.bind($parent.parentVM), css: {selected: id === $parent.parentVM[$parent.key]()}"></div></div>'
    })

    ko.components.register('location-search-box', {
        viewModel: function(params) {
            this.parentVM = params.parentVM
            this.active = ko.observable() //输入框是否为激活状态，激活状态
            this.query = ko.observable(params.parentVM.query()) //输入框的结果
            this.query.subscribe(function (value) {
                this.parentVM.queryTemp(value)
            }, this)
            this.suggestions = ko.observableArray() //搜索结果列表
            this.activeSuggestionIndex = ko.observable(-1) //选中状态的结果的index
            this.hint = ko.observable() //提示文字

            this.scrollTop = ko.computed(function () {
                return 38 * (this.activeSuggestionIndex() + 1) - 298
            }, this)

            this.blur = function () {
                setTimeout(_.bind(function () {
                    this.active(false)
                }, this), 50)
            }

            this.focus = function () {
                if(this.query()) {
                    this.active(true)
                }
            }

            this.lastSearchText = ko.observable()

            this.search = _.bind(function () {
                this.activeSuggestionIndex(-1)
                var name = this.query()
                this.lastSearchText(name)
                this.active(true)
                if (name === undefined || !name.length) {
                    this.hint(window.i18n('请输入内容后再进行搜索'))
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
                                this.hint(window.i18n('无结果'))
                            }
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
                    return this.search()
                }
                if(!window.team.isPhone()) {
                    switch(e.keyCode) {
                        case 13: //enter
                            if(this.activeSuggestionIndex() === -1) {
                                this.search()
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
                this.active(false)
                this.hideSearchModal()
                this.searchBySuggestion(item)
            }, this)

            this.searchBySuggestion = function (item) {
                var param = {}
                _.each(module.suggestionTypeList, function (slug) {
                    if(item[slug]) {
                        param[slug] = item[slug]
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
                this.hideSearchModal()
                this.parentVM.searchTicket.call(this.parentVM)
            }
        },
        template: { element: window.team.isPhone() ? 'location-search-box-mobile' : 'location-search-box' }
    })

    ko.bindingHandlers.fastChosen = {
        init: function(element, valueAccessor, allBindings)  {
            $(element)[window.team.isPhone() ? 'chosenPhone' : 'chosen']({disable_search_threshold: 10, inherit_select_classes: true, disable_search: true, width: '100%'})
            //ko.bindingHandlers.value.init.apply(this, arguments)
        },
        update: function(element, valueAccessor, allBindings) {
            if(typeof valueAccessor()() === 'string' && valueAccessor()().length) {
                $(element).trigger('chosen:updated')
            }
        }
    }

    ko.bindingHandlers.changeText = {
        init: function(element, valueAccessor, allBindings)  {
            $(element).on('change', function () {
                var originObj = _.extend(valueAccessor().obj())
                if($(element).is('select')) {
                    originObj[valueAccessor().prop] = $(this).find('option:selected').text()
                } else if($(element).is('input')) {
                    originObj[valueAccessor().prop] = $(this).val()
                } else if($(element).is('filter-tags')) {
                    originObj[valueAccessor().prop] = $(this).find('.toggleTag.selected').text()
                }
                ga('send', 'event', 'rent_list', 'change', valueAccessor().prop, originObj[valueAccessor().prop])
                valueAccessor().obj(originObj)
            })
        },
    }

})(window.ko, window.currantModule = window.currantModule || {})
