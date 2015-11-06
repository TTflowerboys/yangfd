(function (module) {
    module.InitFilterOfNeighborhoodSubwaySchool = function(option) { //初始化"街区/地铁/学校"的filter

        var _this = this
        _this.Event = $('<i></i>')
        var $container = $('.selectNeighborhoodSubwaySchoolWrap')
        var $containerAll = $container.add($container.prev('span')).add($container.next('span'))
        $containerAll.hide()
        var $citySelect = option.citySelect
        var $countrySelect = option.countrySelect
        var dataMap = {
            neighborhood: {
                country: ['GB'],
                city: ['London']
            },
            school: {
                country: ['GB'],
                city: ['*']
            },
            subwayLine: {
                country: [],
                city: []
            },
        }
        var selectMap = {
            parent: $container.find('[name=parent]'),
            neighborhood: $container.find('[name=neighborhood]'),
            school: $container.find('[name=school]'),
            subwayLine: $container.find('[name=subwayLine]'),
            subwayStation: $container.find('[name=subwayStation]')
        }
        var chosenMap = {}
        var parentSelectHtml = selectMap.parent.html()

        _.each(selectMap, function (elem) {
            if(!window.team.isPhone()) {
                elem.chosen({
                    disable_search_threshold: 8,
                    inherit_select_classes: true,
                    display_disabled_options: false,
                    width: '240px'
                })

            } else {
                elem.chosenPhone({
                    disable_search_threshold: 8,
                    inherit_select_classes: true,
                    display_disabled_options: false,
                })
            }
            elem.bind('change', function () {
                _this.Event.trigger('action')
            })
            chosenMap[elem.attr('name')] = elem.next('.chosen-container')
        })
        var getListAction = {
            neighborhood: function getNeighborhoodList (params) {
                window.geonamesApi.getNeighborhood(params, function (val) {
                    selectMap.neighborhood.html(
                        _.reduce(val, function(pre, val, key) {
                            return pre + '<option value="' + val.id + '">' + val.name + (val.parent && val.parent.name ? ', ' + val.parent.name : '') + '</option>'
                        }, '<option value="">' + i18n('请选择街区') + '</option>')
                    ).trigger('chosen:updated')
                })
            },
            school: function getSchoolList(params) {
                window.geonamesApi.getSchool(params, function (val) {
                    selectMap.school.html(
                        _.reduce(val, function(pre, val, key) {
                            return pre + '<option value="' + val.id + '">' + val.name + (val.parent && val.parent.name ? ', ' + val.parent.name : '') + '</option>'
                        }, '<option value="">' + i18n('请选择学校') + '</option>')
                    ).trigger('chosen:updated')
                })
            },
            subwayLine: function getSubwayLineList () {

            }
        }
        function initDisplayByCity() {
            var city = $citySelect.val()
            var country = $countrySelect.val()
            var cityName = $citySelect.find(':selected').text().trim()
            if (_.every(dataMap, function (obj) {
                    return obj.country.indexOf(country) < 0 && obj.country.indexOf('*') < 0 || (obj.city.indexOf(cityName) < 0 && obj.city.indexOf('*') < 0)
                })) {
                $containerAll.parent('.category').removeClass('three')
                $containerAll.hide()
                return
            } else {
                $containerAll.parent('.category').addClass('three')
            }
            selectMap.parent.html(parentSelectHtml)
            _.each(dataMap, function (obj, key) {
                if(obj.country.indexOf(country) < 0 && obj.country.indexOf('*') < 0 || (obj.city.indexOf(cityName) < 0 && obj.city.indexOf('*') < 0)) {
                    selectMap.parent.find('[value=' + key + ']').prop('disabled', true)
                } else {
                    var params = _.omit({
                        country: country,
                        city: city
                    }, _.isEmpty)
                    getListAction[key].call(null, params)
                    selectMap.parent.find('[value=' + key + ']').prop('disabled', false)
                }
            })
            selectMap.parent.trigger('chosen:updated')
            showChosen('parent')
            if(window.team.isPhone()) {
                $container.show()
            } else{
                $containerAll.show()
            }
        }
        function initDisplayByCountry () {
            var country = $countrySelect.val()
            var cityName = $citySelect.find(':selected').text().trim()
            if (_.every(dataMap, function (obj) {
                    return obj.country.indexOf(country) < 0 && obj.country.indexOf('*') < 0
                })) {
                $containerAll.parent('.category').removeClass('three')
                $containerAll.hide()
                return
            } else {
                $containerAll.parent('.category').addClass('three')
            }
            selectMap.parent.html(parentSelectHtml)
            _.each(dataMap, function (obj, key) {
                if((obj.country.indexOf(country) < 0 && obj.country.indexOf('*') < 0) || (obj.city.indexOf(cityName) < 0 && obj.city.indexOf('*') < 0)) {
                    selectMap.parent.find('[value=' + key + ']').prop('disabled', true)
                } else {
                    selectMap.parent.find('[value=' + key + ']').prop('disabled', false)
                }
            })
            selectMap.parent.trigger('chosen:updated')
            showChosen('parent')
            if(window.team.isPhone()) {
                $container.show()
            } else{
                $containerAll.show()
            }
        }
        initDisplayByCountry()
        initDisplayByCity()
        $citySelect.bind('change', function () {
            //var city = $citySelect.val()
            //var cityName = $citySelect.find(':selected').text().trim()
            _.each(selectMap, function (elem) {
                elem.val('').trigger('change')
            })
            initDisplayByCity()
        })
        $countrySelect.bind('change', function () {
            _.each(selectMap, function (elem) {
                elem.val('').trigger('change')
            })
            initDisplayByCountry()
        })

        function showChosen(name) {
            //console.log('showChosen was called by name :' + name)
            _.each(chosenMap, function (chosen, key) {
                if(name !== key) {
                    chosen.hide()
                } else {
                    chosen.show()
                    //openChosen(key)
                }
            })
        }
        function openChosen(name) {
            setTimeout(function(){
                //console.log('openChosen was called by name :' + name)
                selectMap[name].trigger('chosen:open')
            },100)
        }
        showChosen('parent')
        var actionMap = {
            neighborhood: function neighborhood() {
                showChosen('neighborhood')
                openChosen('neighborhood')
            },
            school: function school() {
                showChosen('school')
                openChosen('school')
            },
            subwayLine: function subway() {
                showChosen('subwayLine')
                openChosen('subwayLine')
            }
        }
        selectMap.parent.bind('change', function () {
            if(selectMap.parent.val()) {
                actionMap[selectMap.parent.val()].call(null)
            }
        })
        function addEvent(elem, event, listener, capture) {
            if(elem.addEventListener){
                elem.addEventListener(event, listener, capture)
            } else {
                $(elem).bind(event, listener)
            }
        }
        _.each(chosenMap, function (elem, key) {
            /*if(key === 'parent') {
             return
             }*/
            addEvent(document.body, 'mousedown', function (event) {
                if($(event.target).parents('.chosen-container').length && $(event.target).parents('.chosen-container').is(elem) && $(event.target).parents('.chosen-single').length){
                    selectMap[key].val('').trigger('change').trigger('chosen:updated')
                    selectMap.parent.val('').trigger('change').trigger('chosen:updated')
                    showChosen('parent')
                    //event.stopPropagation()
                }
            }, true)
            addEvent(document.body, 'mouseup', function (event) {
                if($(event.target).parents('.chosen-container').length && $(event.target).parents('.chosen-container').is(elem) && $(event.target).parents('.chosen-single').length){
                    openChosen('parent')
                }
            }, true)

            /*elem.on('click', '.chosen-single', function (e) {
             openChosen('parent')
             showChosen('parent')
             selectMap[key].val('').trigger('change').trigger('chosen:updated')
             selectMap.parent.val('').trigger('change').trigger('chosen:updated')
             })*/
        })
        _this.getParam = function getParamOfNeighborhoodSubwaySchool() {
            var param = {}
            if(selectMap.parent.val() && selectMap[selectMap.parent.val()].val()) {
                param[selectMap[selectMap.parent.val()].attr('data-serialize')] = selectMap[selectMap.parent.val()].val()
            }
            return param
        }
        _this.getUrlParam = function () {
            var param = {}
            if(selectMap.parent.val() && selectMap[selectMap.parent.val()].val()) {
                param[selectMap.parent.val()] = selectMap[selectMap.parent.val()].val()
            }
            return param
        }
        _this.Event.bind('action', function () {
            _this.param = _this.param || {}
            var param = _this.getParam()
            if(!_.isEqual(_this.param, param)) {
                _this.Event.trigger('change')
                _this.param = param
            }
        })
    }
})(window.currantModule = window.currantModule || {})