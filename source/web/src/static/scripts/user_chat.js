$(function(){
    var $headerButtons = $('.contentHeader .buttons')
    var $headerTabs = $('.tabs')
    var $chatListContent = $('.chatListContent')
    var $loadIndicator = $('.loadIndicator')
    var $placeholder = $('.emptyPlaceHolder')
    var $chatListHeader = $('.chatListHeader')
    var chatCurrentTabHash = location.hash.slice(1).toLowerCase()
    var chatTpl = {
        items : function(rent_id,rent_title,rent_ticket_id,rent_ticket_user_id,user_nickname){
            return '<div class="chatListItmes"><div class="title"><span class="name">'+team.getUserName(user_nickname)+'</span><a href="/property-to-rent/'+rent_id+'" target="_blank">'+rent_title+'</a></div><div class="info"><div class="message" data-id="'+rent_ticket_id+'" data-user_id="'+rent_ticket_user_id+'">'+i18n('用户消息加载中')+'...</div></div><a href="/user-chat/'+rent_ticket_id+'/details" class="reply" target="_blank">'+i18n('回复')+'</a></div>';
        },
        message : function(message,time){
            return '<span class="text">'+message+'</span><span class="msgtime">'+team.parsePublishDate(parseInt(time))+'</span>'
        },
        itemsNew : function(rent_id,rent_title,rent_ticket_id,rent_ticket_user_id,user_nickname,message,time){
            return '<div class="chatListItmes"><div class="title"><span class="name">'+team.getUserName(user_nickname)+'</span><a href="/property-to-rent/'+rent_id+'" target="_blank">'+rent_title+'</a></div><div class="info sent"><div class="message" data-id="'+rent_ticket_id+'" data-user_id="'+rent_ticket_user_id+'"><span class="text">'+message+'</span><span class="msgtime">'+team.parsePublishDate(parseInt(time))+'</span></div></div><a href="/user-chat/'+rent_ticket_user_id+'/details" class="reply" target="_blank">'+i18n('回复')+'</a></div>';
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

    // 
    function loadChat(content,placehoder,options){
        // This is the easiest way to have default options.
        var params = $.extend({ status: 'requested', per_page: 10 }, options );

        $placeholder.hide()
        $chatListHeader.hide()
        $chatListContent.hide()
        $loadIndicator.show()

        if (content.html() === '') {
            $.betterPost('/api/1/rent_intention_ticket/search',params)
                .done(function (val) {
                    var array = val
                    if (array && array.length > 0) {
                        var Tpl = '';
                        $chatListHeader.show()
                        $(array).each(function (i, va){
                            Tpl += chatTpl.items(va.interested_rent_tickets[0].id,va.interested_rent_tickets[0].title,va.id,va.user.id,va.nickname)
                        })
                        content.show().html(Tpl);
                        completeMsg()
                    } else {
                        $chatListHeader.hide()
                        placehoder.show()
                    }
                }).fail(function (ret) {
                    placehoder.show()
                    $chatListHeader.hide()
                }).always(function () {
                    $loadIndicator.hide()
                    content.find('.chatListItmes').find('.message').trigger('loadChatMsg')
                })
        }else{
            $chatListContent.hide()
            $loadIndicator.hide()
            $chatListHeader.show()
            content.show()            
        }
    }

    // default load tenantChatList
    if (location.hash.slice(1) === '') {
        loadChat($('#tenantChatListContent'),$('#tenantPlaceHolder'),{'user_id': window.user.id})
    }

    function switchTypeTab(state) {
        $('.ui-tabs-nav li').removeClass('ui-tabs-selected')
        $('.ui-tabs-nav .' + state.replace('Only', '')).addClass('ui-tabs-selected')
        $('.buttons .button').removeClass('button').addClass('ghostButton')
        $('.buttons .' + state.replace('Only', '')).removeClass('ghostButton').addClass('button')
        location.hash = state
    }
    $(window).on('hashchange', function () {
        var hash = location.hash.slice(1)
        switch(hash) {
        case 'tenant':
            switchTypeTab(hash)
            loadChat($('#tenantChatListContent'),$('#tenantPlaceHolder'),{'user_id': window.user.id})
            break
        case 'host':
            switchTypeTab(hash)
            loadChat($('#hostChatListContent'),$('#hostPlaceHolder'),{'interested_rent_ticket_user_id': window.user.id})
            break
        }
    })
    $(window).trigger('hashchange')
    _.each(['Host', 'Tenant'], function (val) {
        $('button#show' + val + 'Btn').click(function () {
            switchTypeTab(val.toLowerCase())
        })
        $('#show' + val + 'Tab').click(function () {
            switchTypeTab(val.toLowerCase())
        })
    })


    function completeMsg(){
        $('.chatListItmes .message').on('loadChatMsg',function(){
            var $this = $(this)
            var val = $this.data('id')
            var target_user_id = $this.data('user_id')
            $.betterPost('/api/1/rent_intention_ticket/'+val+'/chat/history', {target_user_id: target_user_id,per_page:1})
                .done(function (data) {
                    if (data && data.length > 0) {
                        if (data[0].status === 'sent') { $this.addClass('sent') }
                        var lastChatTpl = chatTpl.message(data[0].message,data[0].time)
                        $this.html(lastChatTpl);
                    }else{
                        $this.html(i18n('没有最新留言'));
                    }
                })
                .fail(function (ret) {
                    $this.html(window.getErrorMessageFromErrorCode(ret));
                })
        })
    }

    if (!window.wsListeners) { window.wsListeners = [] }
    var listener = {};
    listener.onreceivemessage = function(socketVal) {

        $('.chatListItmes .message').on('socketChatMsg',function(){
            var $this = $(this)
            var val = $this.data('id')
            var target_user_id = $this.data('user_id')

            if (socketVal.ticket_id === val && socketVal.from_user.id === target_user_id) {
                if (socketVal.status === 'sent') { $this.addClass('sent') }
                    var lastChatTpl  = chatTpl.message(socketVal.message,socketVal.time)
                    $this.html(lastChatTpl);    
            }else if(chatCurrentTabHash === 'host' && !val) {
                 // add new ticket order
                $.betterPost('/api/1/rent_intention_ticket/search', {'status': 'requested','interested_rent_ticket_user_id': window.user.id})
                    .done(function (data) {
                        $('#hostPlaceHolder').show()
                        var Tpl =chatTpl.itemsNew(data.interested_rent_tickets[0].id,data.interested_rent_tickets[0].title,data.id,socketVal.from_user.id,data.interested_rent_tickets[0].user.nickname,socketVal.message,socketVal.time)
                        $('#hostChatListContent').prepend(Tpl)
                    })
                    .fail(function (ret) {
                        window.dhtmlx.message({ type: 'error', text: window.getErrorMessageFromErrorCode(ret) })
                    })
            }else if((chatCurrentTabHash === '' || chatCurrentTabHash === 'tenant') && !val){
                $.betterPost('/api/1/rent_intention_ticket/search', {'status': 'requested','user_id': window.user.id})
                    .done(function (data) {
                        $('#tenantPlaceHolder').show()
                        var Tpl =chatTpl.itemsNew(data.interested_rent_tickets[0].id,data.interested_rent_tickets[0].title,data.id,socketVal.from_user.id,data.interested_rent_tickets[0].user.nicename,socketVal.message,socketVal.time)
                        $('#tenantChatListContent').prepend(Tpl)
                    })
                    .fail(function (ret) {
                        window.dhtmlx.message({ type: 'error', text: window.getErrorMessageFromErrorCode(ret) })
                    })
            }
        })
        $('.chatListItmes .message').trigger('socketChatMsg')
        
    }
    window.wsListeners.push(listener)

})
