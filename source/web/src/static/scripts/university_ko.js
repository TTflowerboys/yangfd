(function (ko, module) {       
    /*
    * 求租咨询单，大学搜索选择的控件
    * */
    ko.components.register('university-search-box', {
        viewModel: function(params) {            
            this.activeInput = ko.observable(false) //输入框是否为激活状态，激活状态
            this.query = ko.observable() //输入框的结果
            this.lastSearchText = ko.observable() //输入框的结果
            this.lastSuggestion = ko.observable()

            this.suggestions = ko.observableArray() //搜索结果列表
            this.activeSuggestionIndex = ko.observable(-1) //选中状态的结果的index
            this.hint = ko.observable() //提示文字
            this.hesaUniversityEnum = null
            this.getHesaUniversityEnum = _.bind(function(callback) {
                if (this.hesaUniversityEnum) {
                    callback(this.hesaUniversityEnum)
                }
                else {
                    window.project.getEnum('featured_facility_type')
                    .then(function (val) {
                        this.hesaUniversityEnum = _.find(val, function (ele) {
                            return ele.slug === 'hesa_university'
                        })
                        callback(this.hesaUniversityEnum)
                    })
                }
            })

            this.scrollTop = ko.computed(function () {
                return 38 * (this.activeSuggestionIndex() + 1) - 298
            }, this)

            this.blur = function () {
                setTimeout(_.bind(function () {
                    this.activeInput(false)
                }, this), 150)
            }

            this.focus = function () {
                this.activeInput(true)
                if(this.query()) {
                    this.search()
                }
            }

            this.search = _.bind(function () {
                this.getHesaUniversityEnum(_.bind(function (hesaUniversityEnum) {                                        
                    var name = this.query()
                    this.lastSearchText(name)
                    this.activeInput(true)
                    if (name === undefined || !name.length) {
                        this.hint('')
                        this.suggestions([])
                    } else {
                        if (!this.suggestions().length) {
                            this.hint(window.i18n('载入中...'))
                        }
                        window.geonamesApi.mixedIndexSearch({ suggestion: name, country: 'GB', type: hesaUniversityEnum.id }).
                            then(_.bind(function (resultsOfMixedSearch) {
                                var suggestions = resultsOfMixedSearch                                                                                                                                                                    
                                this.hint('')                          
                                if (this.query() === name) {
                                    this.suggestions(suggestions)
                                }
                            }, this))
                    }
                }, this))
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
            // 这里之所以添加keyPress事件是为了判断keyUp中接收的enter按键是来自于中文输入法中敲下的enter还是真的在输入框下输入的enter
            // 所以当修改location-search-box这个compent的时候，需要在input的event这个bind中同时加入keyup和keypress事件
            this.enterComfire = false
            this.keyPress = function (vm, ev) {
                if (ev.key === 'Enter') {
                    this.enterComfire = true
                }
                else {
                    this.enterComfire = false
                }
                return true
            }
            this.keyUp = function (viewModel, e) {
                if(this.query() !== this.lastSearchText() && e.keyCode !== 13) {
                    return this.search()
                }
                if(!window.team.isPhone()) {
                    switch(e.keyCode) {
                        case 13: //enter
                            if (this.enterComfire === false) {
                                return this.search()
                            }
                            if(this.activeSuggestionIndex())  {
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
                this.lastSuggestion(item.name)
                this.activeInput(false)
            }, this)

            this.clear = function () {
                this.query('')
                this.lastSearchText('')
                this.lastSuggestion('')
            }
        },
        template: { element: 'university_search_box'}
    })
})(window.ko, window.currantModule = window.currantModule || {})
