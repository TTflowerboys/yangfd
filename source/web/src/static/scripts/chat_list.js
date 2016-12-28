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
            'status': 'requested',
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
                        Tpl += '<div class="chatListItmes">';
                        Tpl += '<div class="title"><a href="/property-to-rent/'+va.interested_rent_tickets[0].id+'" target="_blank">'+va.interested_rent_tickets[0].title+'</a></div>';
                        Tpl += '<div class="info" data-id="'+va.id+'" data-user_id="'+va.interested_rent_tickets[0].user.id+'"><div class="loading">'+i18n('用户消息加载中')+'...</div></div>';
                        Tpl += '<a href="/user-chat/'+va.id+'/details" class="reply" target="_blank">'+i18n('回复')+'</a>';
                        Tpl += '</div>';
                    })
                    $('#chatListContent').html(Tpl);
                    completeMsg()
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
                $('.chatListItmes .info').trigger('loadChatMsg')
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
                        Tpl += '<div class="chatListItmes">';
                        Tpl += '<div class="title"><a href="/property-to-rent/'+va.interested_rent_tickets[0].id+'" target="_blank">'+va.interested_rent_tickets[0].title+'</a></div>';
                        Tpl += '<div class="info" data-id="'+va.id+'" data-user_id="'+va.user.id+'"><div class="loading">'+i18n('用户消息加载中')+'...</div></div>';
                        Tpl += '<a href="/user-chat/'+va.id+'/details" class="reply" target="_blank">'+i18n('回复')+'</a>';
                        Tpl += '</div>';
                    })
                    $('#chatListContent').html(Tpl);
                    completeMsg()
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
                $('.chatListItmes .info').trigger('loadChatMsg')
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

    //TODO tomlei please use the hash tag state really related with the chat logic
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


    function completeMsg(){
        $('.chatListItmes .info').on('loadChatMsg',function(){
            var $this = $(this),val = $this.data('id'),target_user_id = $this.data('user_id');
            $.betterPost('/api/1/rent_intention_ticket/'+val+'/chat/history', {target_user_id: target_user_id})
                .done(function (data) {
                    if (data && data.length > 0) {
                        if (data[0].status === 'sent') { $this.addClass('sent') }
                        var lastChatTpl  = '<div class="name">'+data[0].from_user.nickname.substring(1,-1)+'**</div>';
                        lastChatTpl += '<div class="message"><div class="text">'+data[0].message+'</div>';
                        lastChatTpl += '<div class="time">'+team.parsePublishDate(parseInt(data[0].time))+'</div></div>';
                        $this.html(lastChatTpl);
                    }else{
                        $this.html('<div class="loading">'+i18n('没有最新留言')+'</div>');
                    }
                })
                .fail(function (ret) {
                    $this.html('<div class="loading">'+window.getErrorMessageFromErrorCode(ret)+'</div>');
                    //window.dhtmlx.message({ type: 'error', text: window.getErrorMessageFromErrorCode(ret) })
                })
        })
    }

    if (!window.wsListeners) { window.wsListeners = [] }
    var listener = {};
    listener.onreceivemessage = function(socketVal) {

        $('.chatListItmes .info').on('socketChatMsg',function(){
            var $this = $(this)
            var val = $this.data('id')
            var target_user_id = $this.data('user_id')

            if (socketVal.ticket_id === val && socketVal.from_user.id === target_user_id) {
                if (socketVal.status === 'sent') { $this.addClass('sent') }
                var lastChatTpl  = '<div class="name">'+socketVal.from_user.nickname.substring(1,-1)+'**</div>';
                lastChatTpl += '<div class="message"><div class="text">'+socketVal.message+'</div>';
                lastChatTpl += '<div class="time">'+team.parsePublishDate(parseInt(socketVal.time))+'</div></div>';
                $this.html(lastChatTpl);
            }else if(location.hash.slice(1).toLowerCase() === 'rent' && !val) {
                 // add new ticket order
                $.betterPost('/api/1/rent_intention_ticket/search', {'status': 'requested','interested_rent_ticket_user_id': window.user.id})
                    .done(function (data) {
                        $('#rentPlaceHolder').show()
                        var Tpl = '<div class="chatListItmes">';
                            Tpl += '<div class="title"><a href="/property-to-rent/'+data.interested_rent_tickets[0].id+'" target="_blank">'+data.interested_rent_tickets[0].title+'</a></div>';
                            Tpl += '<div class="info sent" data-id="'+data.id+'" data-user_id="'+socketVal.from_user.id+'">';
                            Tpl += '<div class="name">'+socketVal.from_user.nickname.substring(1,-1)+'**</div>';
                            Tpl += '<div class="message"><div class="text">'+socketVal.message+'</div>';
                            Tpl += '<div class="time">'+team.parsePublishDate(parseInt(socketVal.time))+'</div></div></div>';
                            Tpl += '<a href="/user-chat/'+data.id+'/details" class="reply" target="_blank">'+i18n('回复')+'</a>';
                            Tpl += '</div>';
                            $('#chatListContent').prepend(Tpl)
                    })
                    .fail(function (ret) {
                        window.dhtmlx.message({ type: 'error', text: window.getErrorMessageFromErrorCode(ret) })
                    })
            }
        })
        $('.chatListItmes .info').trigger('socketChatMsg')
        
    }
    window.wsListeners.push(listener)

})
