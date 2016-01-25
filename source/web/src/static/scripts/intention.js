(function (ko, module) {
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

    $('[data-tabs]').tabs({trigger: 'hover'})

    //点击开始查找出租房产
    function IntentionViewModel() {
        this.searchTicketClick = function () {
            $('location-search-box').trigger('searchTicket')
        }
        this.query = ko.observable()
        this.searchTicket = function (query) {
            window.team.openLink('/property-to-rent-list?query=' + query)
        }

        this.searchBySuggestion = function (param) {
            window.team.openLink('/property-to-rent-list?' + _.map(_.pairs(param), function (item) {
                return item.join('=')
            }).join('&'))
        }
        this.clearSuggestionParams = function () {

        }
    }
    module.appViewModel.intentionViewModel = new IntentionViewModel()

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
})(window.ko, window.currantModule = window.currantModule || {})
