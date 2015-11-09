(function (ko, module) {
    ko.bindingHandlers.chosen = {
        init: function(element)  {
            ko.bindingHandlers.options.init.call(this, element)
            $(element)[window.team.isPhone() ? 'chosenPhone' : 'chosen']({disable_search_threshold: 10, inherit_select_classes: true, disable_search: true, width: $(element).outerWidth() + 'px'})
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
            }
        },
        template: '<div data-bind="foreach: list"><span class="property_type" data-bind="text: value, click: $parent.choose.bind($root), css: {selected: id === $root[$parent.key]()}"></span></div>'
    })

    ko.components.register('edit-travel-time', {
        viewModel: function(params) {
            var self = this
            this.item = _.isFunction(params.item) ? ko.computed(function () {
                return params.item()
            }, this) : ko.observable(params.item)
            this.hint = ko.computed(function () {
                return this.item().hint || ''
            }, this)
            this.travel = ko.computed({
                read: function () {
                    return this.item().traffic_time || []
                },
                write: function (value) {
                    this.item().traffic_time = value
                }
            }, this)
            this.selectedType = ko.observable(_.find(this.travel(), {default: true}))
            this.timeToChoose = ko.computed(function () {
                this.lastTimeStamp = (new Date()).getTime() //因为knockout的options的bind每次初始化都会默认选择第一个，而且完全无法取消，所以需要一个时间戳来判断是否真的是用户操作在修改time
                if(this.selectedType() && this.selectedType().isRaw) {
                    return [{value: this.selectedType().time.value, unit: window.i18n('分钟')}].concat(params.timeToChoose)
                } else {
                    return params.timeToChoose
                }
                //return [this.selectedType()].concat(params.timeToChoose)
            }, this)
            this.selectedTime = ko.observable(_.find(self.timeToChoose(), {value: self.selectedType() ? self.selectedType().time.value : ''}))
            this.lastTimeStamp = (new Date()).getTime()

            this.changeMode = function (data, event) {
                if(self.selectedType()) {
                    self.travel(_.map(_.clone(self.travel()), function (item, index) {
                        if(item.type.slug === self.selectedType().type.slug) {
                            item.default = true
                        } else {
                            item.default = false
                        }
                        return item
                    }))
                    chooseTime()
                }
            }
            this.changeTime = function (data, event) {
                if(self.selectedType() && self.selectedType().time.value !== self.selectedTime().value && (new Date()).getTime() - this.lastTimeStamp > 20) {
                    self.travel(_.map(_.clone(self.travel()), function (item, index) {
                        if(item.type.slug === self.selectedType().type.slug) {
                            item.isRaw = false
                            item.time.value = self.selectedTime().value
                            self.selectedType(self.travel()[index])
                        }
                        return item
                    }))
                    chooseTime()
                }
            }
            function chooseTime() {
                var time = _.find(self.timeToChoose(), {value: self.selectedType().time.value})
                self.selectedTime(time)
            }
        },
        template: { element: 'edit-travel-time' }
    })

    module.distanceMatrix = function distanceMatrix(origins, destinations, modes) {
        origins = _.isArray(origins) ? origins.join('|') : origins
        destinations = _.isArray(destinations) ? destinations.join('|') : destinations
        return $.when.apply(null, _.map(modes, function (mode) {
            var apiUri = 'https://maps.googleapis.com/maps/api/distancematrix/json?origins=' + origins + '&destinations=' + destinations + '&mode=' + mode.slug + '&language=en-GB&key=AIzaSyCXOb8EoLnYOCsxIFRV-7kTIFsX32cYpYU'
            return $.get('/reverse_proxy?link=' + encodeURIComponent(apiUri))
        }))
            .then(function () {
                return Array.prototype.slice.call(arguments).map(function (arr) {
                    var item = arr[0]
                    return item
                })
            })
    }

    ko.components.register('surrouding-search-input', {
        viewModel: function(params) {
            function getUniversities(name) {
                return $.get('/api/1/hesa_university/search', {name: name})
                    .then(function (data) {
                        return data.val
                    })
            }
            function getStations(name) {
                return $.get('/api/1/doogal_station/search', {name: name})
                    .then(function (data) {
                        return data.val
                    })
            }
            this.surroudingToAdd = params.surroudingToAdd
            this.active = ko.observable() //输入框是否为激活状态，激活状态
            this.result = ko.observable() //输入框的结果
            this.suggestions = ko.observableArray() //搜索结果列表
            this.hint = ko.observable() //提示文字

            this.search = _.bind(function () {
                var name = this.result()
                this.active(true)
                this.suggestions([])
                if (name === undefined || !name.length) {
                    this.hint(window.i18n('请输入内容后再进行搜索'))
                } else {
                    this.hint(window.i18n('载入中...'))
                    $.when(getUniversities(name), getStations(name), window.project.getEnum('featured_facility_type'))
                    .then(_.bind(function (resultsOfUniversities, resultsOfStations, types) {
                            function typeMapFactory(slug) {
                                return function (item) {
                                    item.type = _.find(types, {slug: slug})
                                    return item
                                }
                            }
                            var suggestions = (_.map(resultsOfUniversities, typeMapFactory('hesa_university'))).concat(_.map(resultsOfStations, typeMapFactory('doogal_station')))
                            suggestions = suggestions.concat(suggestions).concat(suggestions)
                            this.suggestions(suggestions)
                            if(suggestions.length) {
                                this.hint('')
                            } else {
                                this.hint(window.i18n('无结果'))
                            }
                        }, this))
                }
            }, this)

            this.select = _.bind(function (item) {
                this.result(item.name)
                this.active(false)
                this.surroudingToAdd(_.extend(item, {traffic_time: [], hint: window.i18n('载入中...')}))
                window.project.getEnum('featured_facility_traffic_type')
                    .then(_.bind(function (modes) {
                        module.distanceMatrix($('#postcode').val().replace(/\s/g, '').toUpperCase(), item.postcode_index || item.zipcode_index, modes)
                            .then(_.bind(function (matrixData) {
                                _.extend(item, {
                                    hint: '',
                                    traffic_time: _.map(matrixData, function (data, innerIndex) {
                                        var elements = JSON.parse(data).rows[0].elements
                                        var time = elements[0].duration ? Math.round(elements[0].duration.value / 60).toString() : ''
                                        return {
                                            default: innerIndex === 0 ? true : false, //表示UI界面选中的交通方式
                                            isRaw: true, //表示是从Google Distance Matrix API取的时间没有更改过
                                            type: modes[innerIndex],
                                            time: {
                                                value: time,
                                                unit: window.i18n('分钟')
                                            }
                                        }
                                    })
                                })
                                this.surroudingToAdd(item)
                            },this))
                    }, this))
            }, this)
        },
        template: { element: 'surrouding-search-input' }
    })
})(window.ko, window.currantModule = window.currantModule || {})