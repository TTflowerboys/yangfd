$(function(){
    var $headerButtons = $('.contentHeader .buttons')
    var $headerTabs = $('.tabs')
    var $chatListContent = $('.chatListContent')
    var $loadIndicator = $('.loadIndicator')
    var $placeholder = $('.emptyPlaceHolder')
    var $chatListHeader = $('.chatListHeader')
    var lastTenantItemTime
    var lastHostItemTime
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
    var lastItemTime
    if (location.hash.slice(1) === '' || location.hash.slice(1) === 'tenant') {
        lastItemTime = lastTenantItemTime
    }else if(location.hash.slice(1) === 'host'){
        lastItemTime = lastHostItemTime
    }
    function loadChat(content, placeholder, options, callback){
        // This is the easiest way to have default options.
        lastItemTime = options.time
        var params = $.extend({ status: 'requested', per_page: 10}, options );

        $loadIndicator.show()

        if (lastItemTime) {
            params.time = lastItemTime
        }

        content.attr('data-isloading',true)

        $.betterPost('/api/1/rent_intention_ticket/search',params)
            .done(function (val) {
                var array = val
                if (array && array.length > 0) {
                    lastItemTime = _.last(array).time
                    $(array).each(function (i, va){
                        var Tpl = '';
                        Tpl += chatTpl.items(va.interested_rent_tickets[0].id,va.interested_rent_tickets[0].title,va.id,va.user.id,va.nickname)
                        if (lastItemTime > va.time) {
                            lastItemTime = va.time
                        }
                        content.show().append(Tpl);
                    })
                    completeMsg()
                    content.attr('data-allloaded',false)
                    placeholder.hide()
                    $chatListHeader.show()
                } else {
                    content.attr('data-allloaded',true)
                    if (content.html() === '') {
                        $chatListHeader.hide()
                        placeholder.show()
                    }
                }
                if (callback) { callback() }
            }).fail(function (ret) {
            }).always(function () {
                $loadIndicator.hide()
                content.find('.chatListItmes').find('.message').trigger('loadChatMsg')
                content.attr('data-lasttime',lastItemTime)
                content.attr('data-isloading',false)
            })
    }

    function needLoad(obj) {
        var scrollPos = $(window).scrollTop()
        var windowHeight = $(window).height()
        var listHeight = obj.height()
        var needLoadSwitch = windowHeight + scrollPos > listHeight
        var all = obj.attr('data-allloaded') === 'false'? false: true
        var loading = obj.attr('data-isloading') === 'false'? false: true
        return needLoadSwitch && !all && !loading
    }

    // default load tenantChatList
    if (location.hash.slice(1) === '') {
        loadChat($('#tenantChatListContent'),$('#tenantPlaceHolder'),{'user_id': window.user.id})
    }
    // window scroll trigger loadChatList
    $(window).scroll(function(){
        if (location.hash.slice(1) === '' || location.hash.slice(1) === 'tenant') {
            if (needLoad($('#tenantChatListContent'))) {
                loadChat($('#tenantChatListContent'), $('#tenantPlaceHolder'), {'user_id': window.user.id, 'time': $('#tenantChatListContent').attr('data-lasttime')})
            }
        }else if(location.hash.slice(1) === 'host'){
            if(needLoad($('#hostChatListContent'))){
                loadChat($('#hostChatListContent'), $('#hostPlaceHolder'), {'interested_rent_ticket_user_id': window.user.id,'time': $('#hostChatListContent').attr('data-lasttime')})
            }
        }
    })

    function switchTypeTab(state) {
        $('.ui-tabs-nav li').removeClass('ui-tabs-selected')
        $('.ui-tabs-nav .' + state.replace('Only', '')).addClass('ui-tabs-selected')
        $('.buttons .button').removeClass('button').addClass('ghostButton')
        $('.buttons .' + state.replace('Only', '')).removeClass('ghostButton').addClass('button')
        location.hash = state
    }
    $(window).on('hashchange', function () {
        var hash = location.hash.slice(1)
        $placeholder.hide()
        $chatListHeader.hide()
        $chatListContent.hide()
        switch(hash) {
        case 'tenant':
            switchTypeTab(hash)
            if ($('#tenantChatListContent').html()) {
                $('#tenantChatListContent').show()
                $chatListHeader.show()
            }else{
                lastItemTime = lastTenantItemTime
                loadChat($('#tenantChatListContent'), $('#tenantPlaceHolder'), {'user_id': window.user.id})
            }
            break
        case 'host':
            switchTypeTab(hash)
            if ($('#hostChatListContent').html()) {
                $('#hostChatListContent').show()
                $chatListHeader.show()
            }else{
                lastItemTime = lastHostItemTime
                loadChat($('#hostChatListContent'), $('#hostPlaceHolder'), {'interested_rent_ticket_user_id': window.user.id})
            }            
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
            }
        })
        $('.chatListItmes .message').trigger('socketChatMsg')
        
    }
    window.wsListeners.push(listener)

})
