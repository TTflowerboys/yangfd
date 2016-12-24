$(function(){
    var $headerButtons = $('.contentHeader .buttons')
    var $headerTabs = $('.tabs')
    var $list = $('#chatListContent')
    var isLoading = false
    var xhr
    var placeholder = $('.emptyPlaceHolder')
    var chatListHeader = $('.chatListHeader')


    //Init page with rent
    if (team.isPhone()) {
        if (window.lang === 'zh_Hans_CN') {
            $headerTabs.show()
        }        
    } else {
        if (window.lang === 'zh_Hans_CN') {
            $headerButtons.show()
        }
    }

    loadChatCore()

    // 我的咨询
    function loadChatCore() {
        var defer = $.Deferred()
        
        if (xhr && xhr.readyState !== 4) {
            xhr.abort()
        }
        placeholder.hide()
        $list.empty()
        $('.loadIndicator').show()

        var params = {
            'user_id': window.user.id,
            'per_page': -1
        }
        xhr = $.post('/api/1/rent_intention_ticket/search', params)
            .success(function (data) {
                var val = data.val
                var array = val
                if (array && array.length > 0) {
                    var Tpl = '';
                    chatListHeader.show()
                    $(array).each(function (i, va){
                        Tpl += '<div class="chatListItmes"><div class="title">';
                        Tpl += '<a href="/property-to-rent/'+va.interested_rent_tickets[0].id+'" target="_blank">'+va.interested_rent_tickets[0].title+'</a></div>';
                        Tpl += '<div class="info"><div class="name">'+va.interested_rent_tickets[0].user.nickname+'</div>';
                        Tpl += '<div class="massage"><div class="text">'+(va.interested_rent_tickets[0].description === undefined? '': va.interested_rent_tickets[0].description)+'</div>';
                        Tpl += '<div class="time"  data-utc-time="">'+team.parsePublishDate(parseInt(va.interested_rent_tickets[0].time))+'</div>';
                        Tpl += '<a href="/user-chat/'+va.id+'/details" class="reply" target="_blank">'+i18n('回复')+'</a>';
                        Tpl += '</div></div></div>';
                    })
                    $('#chatListContent').html(Tpl);
                } else {
                    chatListHeader.hide()
                    $('#intentionPlaceHolder').show()
                }
                defer.resolve()
            }).fail(function () {
                $('#intentionPlaceHolder').show()
                chatListHeader.hide()
                defer.reject()
            }).complete(function () {
                $('.loadIndicator').hide()
                isLoading = false
            })
        return defer.promise()
    }

    // 咨询我的
    function loadChatFrom(){
        var defer = $.Deferred()
        
        if (xhr && xhr.readyState !== 4) {
            xhr.abort()
        }
        placeholder.hide()
        $list.empty()
        $('.loadIndicator').show()

        var params = {
            'status': 'requested',
            'interested_rent_ticket_user_id': window.user.id,
            'per_page': -1
        }
        xhr = $.post('/api/1/rent_intention_ticket/search', params)
            .success(function (data) {
                var val = data.val
                var array = val
                if (array && array.length > 0) {
                    var Tpl = '';
                    chatListHeader.show()
                    $(array).each(function (i, va){
                        Tpl += '<div class="chatListItmes"><div class="title">';
                        Tpl += '<a href="/property-to-rent/'+va.interested_rent_tickets[0].id+'" target="_blank">'+va.interested_rent_tickets[0].title+'</a></div>';
                        Tpl += '<div class="info"><div class="name">'+va.user.nickname+'</div>';
                        Tpl += '<div class="massage"><div class="text">'+(va.description === undefined ? '': va.description)+'</div>';
                        Tpl += '<div class="time"  data-utc-time="">'+team.parsePublishDate(parseInt(va.time))+'</div>';
                        Tpl += '<a href="/user-chat/'+va.id+'/details" class="reply" target="_blank">'+i18n('回复')+'</a>';
                        Tpl += '</div></div></div>';
                    })
                    $('#chatListContent').html(Tpl);
                } else {
                    chatListHeader.hide()
                    $('#rentPlaceHolder').show()
                }
                defer.resolve()
            }).fail(function () {
                $('#rentPlaceHolder').show()
                chatListHeader.hide()
                defer.reject()
            }).complete(function () {
                $('.loadIndicator').hide()
                isLoading = false
            })
        return defer.promise()
    }

    function switchTypeTab(state) {
        var originHash = location.hash.slice(1)
        var param = originHash.split('?')[1]
        $('.ui-tabs-nav li').removeClass('ui-tabs-selected')
        $('.ui-tabs-nav .' + state.replace('Only', '')).addClass('ui-tabs-selected')
        $('.buttons .button').removeClass('button').addClass('ghostButton')
        $('.buttons .' + state.replace('Only', '')).removeClass('ghostButton').addClass('button')
        location.hash = state + (param ? '?' + param : '')
    }

    $(window).on('hashchange', function () {
        var hash = location.hash.slice(1)
        var state = hash.split('?')[0]
        var extraParam = hash.split('?')[1]
        var rentStatus
        if(extraParam) {
            rentStatus = decodeURIComponent(extraParam.match(/status=(.+)/)[1]).split(',')
        }
        switch(state) {
            case 'intention':
                switchTypeTab(state)
                loadChatCore(rentStatus)
                break
            case 'rent': //出租申请单
                switchTypeTab(state)
                loadChatFrom()
                break
        }

    })

    $(window).trigger('hashchange')

    _.each(['Rent', 'Intention'], function (val) {
        $('button#show' + val + 'Btn').click(function () {
            switchTypeTab(val.toLowerCase())
        })
        $('#show' + val + 'Tab').click(function () {
            switchTypeTab(val.toLowerCase())
        })
    })
})