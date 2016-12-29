$(function(){
    var $headerButtons = $('.contentHeader .buttons')
    var $headerTabs = $('.tabs')
    var $list = $('#chatListContent')
    var isLoading = false
    var xhr
    var placeholder = $('.emptyPlaceHolder')
    var chatListHeader = $('.chatListHeader')
    var chatTpl = {
        items : function(rent_id,rent_title,rent_ticket_id,rent_ticket_user_id){
            return '<div class="chatListItmes"><div class="title"><a href="/property-to-rent/'+rent_id+'" target="_blank">'+rent_title+'</a></div><div class="info" data-id="'+rent_ticket_id+'" data-user_id="'+rent_ticket_user_id+'"><div class="loading">'+i18n('用户消息加载中')+'...</div></div><a href="/user-chat/'+rent_ticket_id+'/details" class="reply" target="_blank">'+i18n('回复')+'</a></div>';
        },
        message : function(user_nickname,message,time){
            return '<div class="name">'+user_nickname.substring(1,-1)+'**</div><div class="message"><div class="text">'+message+'</div><div class="time">'+team.parsePublishDate(parseInt(time))+'</div></div>';
        },
        itemsNew : function(rent_id,rent_title,rent_ticket_id,rent_ticket_user_id,user_nickname,message,time){
            return '<div class="chatListItmes"><div class="title"><a href="/property-to-rent/'+rent_id+'" target="_blank">'+rent_title+'</a></div><div class="info sent" data-id="'+rent_ticket_id+'" data-user_id="'+rent_ticket_user_id+'"><div class="name">'+user_nickname.substring(1,-1)+'**</div><div class="message"><div class="text">'+message+'</div><div class="time">'+team.parsePublishDate(parseInt(time))+'</div></div></div><a href="/user-chat/'+rent_ticket_user_id+'/details" class="reply" target="_blank">'+i18n('回复')+'</a></div>';
        }
    }


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
                        Tpl += chatTpl.items(va.interested_rent_tickets[0].id,va.interested_rent_tickets[0].title,va.id,va.interested_rent_tickets[0].user.id)
                    })
                    $('#chatListContent').html(Tpl);
                    completeMsg()
                } else {
                    chatListHeader.hide()
                    $('#renterPlaceHolder').show()
                }
                defer.resolve()
            }).fail(function () {
                $('#renterPlaceHolder').show()
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
                        Tpl += chatTpl.items(va.interested_rent_tickets[0].id,va.interested_rent_tickets[0].title,va.id,va.user.id)
                    })
                    $('#chatListContent').html(Tpl);
                    completeMsg()
                } else {
                    chatListHeader.hide()
                    $('#hostPlaceHolder').show()
                }
                defer.resolve()
            }).fail(function () {
                $('#hostPlaceHolder').show()
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

    $(window).on('hashchange', function () {
        var hash = location.hash.slice(1)
        var state = hash.split('?')[0]
        var extraParam = hash.split('?')[1]
        var rentStatus
        if(extraParam) {
            rentStatus = decodeURIComponent(extraParam.match(/status=(.+)/)[1]).split(',')
        }
        switch(state) {
        case 'renter':
            switchTypeTab(state)
            loadChatCore(rentStatus)
            break
        case 'host':
            switchTypeTab(state)
            loadChatFrom()
            break
        }

    })

    $(window).trigger('hashchange')

    _.each(['Host', 'Renter'], function (val) {
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
                        var lastChatTpl = chatTpl.message(data[0].from_user.nickname,data[0].message,data[0].time)
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
                    var lastChatTpl  = chatTpl.message(socketVal.from_user.nickname,socketVal.message,socketVal.time)
                    $this.html(lastChatTpl);
            }else if(location.hash.slice(1).toLowerCase() === 'host' && !val) {
                 // add new ticket order
                $.betterPost('/api/1/rent_intention_ticket/search', {'status': 'requested','interested_rent_ticket_user_id': window.user.id})
                    .done(function (data) {
                        $('#hostPlaceHolder').show()
                        var Tpl =chatTpl.itemsNew(data.interested_rent_tickets[0].id,data.interested_rent_tickets[0].title,data.id,socketVal.from_user.id,socketVal.from_user.nickname,socketVal.message,socketVal.time)
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
