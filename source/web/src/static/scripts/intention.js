(function () {
    //界面显示隐藏
    function ShowState(state) {
        var _this = this
        this.views = $('[data-show]')
        this.state = state
        this.changeState = function (state) {
            this.state = state
            this.change()

        }
        this.change = function () {
            $('.page').css('height', '0px')
            _this.views.each(function () {
                if($(this).attr('data-show') === _this.state) {
                    return $(this).show()
                }
                $(this).hide()
            })
            $('html, body').scrollTop(0)
            $('.page').css('height', 'auto')
        }

        if (!window.team.isCurrantClient()) {
            $('[data-action]').click(function () {
                _this.changeState($(this).attr('data-action'))
            })
        }

        this.change()
    }
    var showState
    showState = new ShowState('main')

    window.chooseUserType = function (userTypeSlug) {
        var $dataUserType = $('ul.mainWrap').find('[data-user-type-slug=' + userTypeSlug + ']')
        var apiUrl = '/api/1/user/edit'
        if (window.betterAjaxXhr && window.betterAjaxXhr[apiUrl] && window.betterAjaxXhr[apiUrl].readyState !== 4) {
            window.betterAjaxXhr[apiUrl].abort()
        }

        $.betterPost(apiUrl, {user_type: $dataUserType.attr('data-user-type')})
            .done(function (data) {
                window.user = data
                if (window.bridge !== undefined) {
                    //login will refresh webview, so must put in the end
                    window.bridge.callHandler('login', data, function () {
                        //but open home tab state depend on user if logged in
                        window.bridge.callHandler('openHomeTab');
                    });
                }
            })
            .fail(function (data) {
            })
    }

    function initChosen (elem) {
        if(!window.team.isPhone()) {
            elem.chosen({
                width: '100%',
                disable_search_threshold: 8
            })
        }
        $(window).bind('resize', function () {
            if(window.team.isPhone()) {
                elem.show().siblings('.chosen-container').hide()
            }else {
                elem.hide().siblings('.chosen-container').show()
            }
        })
    }
    initChosen($('[name=propertyCountry]'))
    initChosen($('[name=propertyCity]'))
    initChosen($('[name=propertyType]'))
    initChosen($('[name=rentType]'))

    //国家城市级联选择
    var $countrySelect = $('select[name=propertyCountry]')
    $countrySelect.change(function () {
        var countryCode = $('select[name=propertyCountry]').children('option:selected').val()
        if(countryCode) {
            updateCityByCountry(countryCode)
        } else {
            clearCity()
        }
    })
    function updateCityByCountry(countryCode){
        var params = {
            'country': countryCode,
            'feature_code': 'city'
        }

        //Empty city select
        $('select[name=propertyCity]').html('<option value="">' + i18n('城市列表加载中...') + '</option>').trigger('chosen:updated')

        //Load city data
        $.betterPost('/api/1/geonames/search', params)
            .done(function (val) {
                $('select[name=propertyCity]').html(
                    _.reduce(val, function(pre, val, key) {
                        return pre + '<option value="' + val.id + '">' + val.name + (countryCode === 'US' ? ' (' + val.admin1 + ')' : '') + '</option>' //美国的城市有很多重名，要在后面加上州名缩写
                    }, '<option value="">' + i18n('任意城市') + '</option>')
                ).trigger('chosen:updated')
            })
            .fail(function(){
            })
    }
    function clearCity() {
        $('select[name=propertyCity]').html('<option value="">' + i18n('任意城市') + '</option>').trigger('chosen:updated')
    }

    $('[data-tabs]').tabs({trigger: 'hover'})

    //点击开始查找出租房产
    $('#findTicket').click(function () {
        var param = {}
        if ($('[name=propertyCountry]').val()) {
           param.country = $('[name=propertyCountry]').val()
        }
        if ($('[name=propertyCity]').val()) {
            param.city = $('[name=propertyCity]').val()
        }
        if ($('[name=propertyType]').val()) {
            param.property_type = $('[name=propertyType]').val()
        }
        if ($('[name=rentType]').val()) {
            param.rent_type = $('[name=rentType]').val()
        }
        location.href = '/property-to-rent-list' + (_.isEmpty(param) ? '' : ('?' + $.param(param)))
    })

    var $intentionform = $('form[name=intentionForm]')

    $intentionform.find('[name=budget]').on('change', function () {
        $(this).parent().toggleClass('selected', this.checked)
            .siblings().removeClass('selected')
        ga('send', 'event', 'intention-selection', 'change', 'change-budget',$(this).parent().text())
    })

    $intentionform.find('[name=intention]').on('change', function () {
        $(this).closest('li').toggleClass('selected', this.checked)
        ga('send', 'event', 'intention-selection', 'change', 'change-intention',$(this).parent().text().replace(/ /g,'').replace(/(\r\n|\n|\r)/gm,''))
    })

    $intentionform.find('[name]').on('change', function () {
        var data = $intentionform.serializeObject()
        $intentionform.find('[type=submit]').prop('disabled', _.isEmpty(data))
    })

    $intentionform.submit(function (e) {
        e.preventDefault()
        ga('send', 'event', 'intention-selection', 'click', 'intention-submit')

        var data = $(this).serializeObject()

        var intentionTags = $(this).find('.intention .controls').children('.selected')
        var intention = ''
        _.each(intentionTags, function (item) {
            intention =  intention + $(item).attr('data-id') + ','
        })

        if (intention) {
            if (_.last(intention) === ',') {
                intention = intention.substring(0, intention.length - 1)
            }
            data.intention = intention
        }

        if (!data.budget && !data.intention) { location.href = '/';  return;}
        $intentionform.find('[type=submit]').css({cursor: 'wait'})
        $.betterPost('/api/1/user/edit', data)
            .done(function(result){

                window.project.goBackFromURL()

                ga('send', 'event', 'intention-selection', 'result', 'intention-submit-success')
            })
            .fail(function(errorCode){
                ga('send', 'event', 'intention-submit', 'result', 'intention-submit-failed',errorCode)
            })
            .always(function () {
                $intentionform.find('[type=submit]').css({cursor: 'default'})
            })
    })

    /*function skipIntention(){
        location.href = '/'
        ga('send', 'event', 'intention-selection', 'click', 'skip-intention-selection')
    }*/
})()
