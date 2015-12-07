(function (ko, module) {

    ko.bindingHandlers.scrollTop = {
        update: function (element, valueAccessor) {
            var value = ko.utils.unwrapObservable(valueAccessor())
            if (value) {
                $(element).scrollTop(value)
            }
        }
    }

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
            this.selectedType = ko.observable(_.find(this.travel(), {default: true}) || this.travel()[0])
            this.timeToChoose = ko.computed(function () {
                var timeToChoose
                this.lastTimeStamp = (new Date()).getTime() //因为knockout的options的bind每次初始化都会默认选择第一个，而且完全无法取消，所以需要一个时间戳来判断是否真的是用户操作在修改time
                if(this.selectedType() && this.selectedType().isRaw) {
                    timeToChoose = [{value: this.selectedType().time.value, unit: window.i18n('分钟')}].concat(generateTimeConfig(12, 5, parseInt(this.selectedType().time.value)))
                } else {
                    timeToChoose = generateTimeConfig(12, 5, this.selectedType() ? parseInt(this.selectedType().time.value) : 0)
                }
                return _.sortBy(timeToChoose, function (item) {
                    return parseInt(item.value)
                })
                //return [this.selectedType()].concat(params.timeToChoose)
            }, this)
            this.selectedTime = ko.observable(_.find(self.timeToChoose(), {value: self.selectedType() ? this.selectedType().time.value : ''}))
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

            function generateTimeConfig(length, interval, arroud) {
                var start
                if(arroud && arroud > length * interval / 2) {
                    arroud = Math.floor(arroud / interval) * interval
                    start = arroud - length * interval / 2
                } else {
                    start = 0
                }
                return new Array(length + 1).join('0').split('').map(function (val, index) {
                    return {value:((index + 1) * interval + (start || 0)).toString(), unit: window.i18n('分钟')}
                })
            }
        },
        template: { element: 'edit-travel-time' }
    })

    module.distanceMatrix = function distanceMatrix(origins, destinations, modes) {
        origins = _.isArray(origins) ? origins.join('|') : origins
        destinations = _.isArray(destinations) ? destinations.join('|') : destinations
        return window.Q.Promise(function (resolve, reject) {
            var postcode = origins.split('|')[0]
            postcode = postcode.indexOf('+') >= 0 ? postcode.split('+')[1] : postcode
            window.geonamesApi.getCountry(postcode)
                .then(function (val) {
                    if(val[0].country === 'GB') {
                        resolve(window.moment(window.moment().day(8).format('YYYY-MM-DD') + ' 9:00 +0000').unix())
                    } else {
                        resolve(window.moment(window.moment().day(8).format('YYYY-MM-DD') + ' 9:00').unix())
                    }
                })
        })
            .then(function (departureTime) {
                return window.Q.all(_.map(modes, function (mode) {
                    var apiUri = 'https://maps.googleapis.com/maps/api/distancematrix/json?origins=' + origins + '&destinations=' + destinations + '&mode=' + mode.slug + '&departure_time=' + departureTime + '&language=en-GB&key=AIzaSyCXOb8EoLnYOCsxIFRV-7kTIFsX32cYpYU'
                    return window.Q($.get('/reverse_proxy?link=' + encodeURIComponent(apiUri)))
                }))
            })
            .then(function (data) {
                return _.map(data, function (item) {
                    item = JSON.parse(item)
                    if(item.status === 'OK' && item.rows) {
                        return item
                    } else {
                        throw new Error(item.msg || window.i18n('googleapis发生了一个错误，请输入正确的postcode后重试'))
                    }
                })
            })
            .fail(function (e) {
                throw new Error(e.message || window.i18n('googleapis发生了一个未知错误，请检查您的网络连接，然后刷新页面后重试'))
            })
    }

    ko.components.register('surrouding-search-input', {
        viewModel: function(params) {
            function mixedSearch(name) {
                return window.Q($.betterPost('/api/1/main_mixed_index/search', {query: name}))
            }
            this.surroudingToAdd = params.surroudingToAdd
            this.active = ko.observable() //输入框是否为激活状态，激活状态
            this.result = ko.observable() //输入框的结果
            this.suggestions = ko.observableArray() //搜索结果列表
            this.activeSuggestionIndex = ko.observable(-1) //选中状态的结果的index
            this.hint = ko.observable() //提示文字

            this.scrollTop = ko.computed(function () {
                return 41 * (this.activeSuggestionIndex() + 1) - 298
            }, this)

            this.blur = function () {
                setTimeout(_.bind(function () {
                    this.active(false)
                }, this), 50)
            }
            this.focus = function () {
                if(this.result()) {
                    this.active(true)
                }

            }
            this.search = _.bind(function () {
                this.activeSuggestionIndex(-1)
                var name = this.result()
                this.active(true)
                this.suggestions([])
                if (name === undefined || !name.length) {
                    this.hint(window.i18n('请输入关键字后再进行搜索'))
                } else {
                    this.hint(window.i18n('载入中...'))
                    window.project.getEnum('featured_facility_type')
                        .then(_.bind(function (types) {
                            mixedSearch(name).
                                then(_.bind(function (resultsOfMixedSearch) {
                                    var suggestions = _.filter((_.map(resultsOfMixedSearch, function (item) {
                                        var intersection = _.intersection(_.map(types, function (type) { return type.slug }), _.keys(item))
                                        if(intersection.length) {
                                            item.type = _.find(types, {slug: intersection[0]})
                                        }
                                        delete item.id
                                        if(item.type) {
                                            item.id = item[item.type.slug]
                                            if(_.find(module.propertyViewModel.surrouding(), function (surroudingItem) {
                                                    return surroudingItem[item.type.slug] === item.id
                                                })) {
                                                item.exist = true
                                            }
                                        }
                                        return item
                                    })), function (item) {
                                        return item.type
                                    })
                                    this.suggestions(suggestions)
                                    if(suggestions.length) {
                                        this.hint('')
                                    } else {
                                        this.hint(window.i18n('无结果'))
                                    }
                                }, this))
                        }, this))
                }
            }, this)

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

            this.select = _.bind(function (item) {
                if(item.exist) {
                    this.activeSuggestionIndex(-1)
                    window.dhtmlx.message({ type:'error', text: window.i18n('该地点已经添加到周边了，请不要重复添加')});
                    return
                }
                if(!module.propertyViewModel.latitude() && !$('#city').val()) {
                    window.dhtmlx.message({ type:'error', text: window.i18n('请填写正确的postcode或地址信息后再添加周边地点')})
                    return
                }
                this.activeSuggestionIndex(-1)
                this.result(item.name)
                this.active(false)
                this.surroudingToAdd(_.extend(item, {traffic_time: [], hint: window.i18n('正在获取到该地点的交通信息...')}))
                window.project.getEnum('featured_facility_traffic_type')
                    .then(_.bind(function (modes) {
                        module.distanceMatrix(($('#city').val() ? ($('#city-select').find('option:selected').text() + '+') : '') + $('#postcode').val().replace(/\s/g, '').toUpperCase(), item.postcode_index || item.zipcode_index || (item.latitude + ',' + item.longitude), modes)
                            .then(_.bind(function (matrixData) {
                                _.extend(item, {
                                    hint: '',
                                    traffic_time: _.map(matrixData, function (data, innerIndex) {
                                        var elements = data.rows[0].elements
                                        var time = elements[0].duration ? Math.round(elements[0].duration.value / 60).toString() : '0'
                                        return {
                                            default: false, //表示UI界面选中的交通方式
                                            isRaw: parseInt(time) % 5 !== 0, //表示是从Google Distance Matrix API取的时间没有更改过
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
                            .fail(_.bind(function (e) {
                                window.dhtmlx.message({ type:'error', text: window.i18n('无法获取到该地点的交通信息:') + e.message});
                                this.surroudingToAdd({hint: window.i18n('添加失败，无法获取到该地点的交通信息')})
                            }, this))
                    }, this))
            }, this)
        },
        template: { element: 'surrouding-search-input' }
    })
})(window.ko, window.currantModule = window.currantModule || {})