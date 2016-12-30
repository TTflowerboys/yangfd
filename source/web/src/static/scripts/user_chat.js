var chat = {
    init : function(){
        $('#btn_send').on('click',function(){
            if (chat.isSendMsg()) { chat.sendTextMessage() }
        })
        $('#btn_send_phone').on('click',function(){
            if (chat.isMobileSendMsg()) { chat.sendMobileTextMessage() }
        })
        $('#edit_area').on('keydown', function(e) {
            if(e.keyCode === team.keyCode.KEYCODE_ENTER){
                if (chat.isSendMsg()) { chat.sendTextMessage() }
                e.preventDefault()
            }
        });
        //chat.historyMessage()
    },
    placeholderPic : {
        'HOST' : '/static/images/chat/placeholder_host.png',
        'Tenant' : '/static/images/chat/placeholder_tenant.png'
    },
    chatConfig : {
        'rentTicketData' : JSON.parse($('#rentTicketData').text()),
        'rent_intention_ticket_id' : (location.href.match(/user\-chat\/([0-9a-fA-F]{24})\/details/) || [])[1]
    },
    target_user_id : function(){
        return window.user.id === chat.chatConfig.rentTicketData.interested_rent_tickets[0].user.id? chat.chatConfig.rentTicketData.creator_user.id: chat.chatConfig.rentTicketData.interested_rent_tickets[0].user.id
    },
    isSendMsg : function(){
        return $('#edit_area').val().trim().length ? true : false;
    },
    isMobileSendMsg : function(){
        return $('#chat_edit_area').val().trim().length ? true : false;
    },
    meMsgTpl : function(picUrl,plain,time){
        return '<div class="message me"><img src="'+picUrl+'" alt="" class="avatar"><div class="content"><div class="bubble bubble_primary right"><div class="bubble_cont"><div class="plain">'+plain+'<span class="date">'+window.project.formatTime(time)+'</span></div></div></div></div></div>'
    },
    defMsgTpl : function(picUrl,plain,time){
        return '<div class="message"><img src="'+picUrl+'" alt="" class="avatar"><div class="content"><div class="bubble bubble_default left"><div class="bubble_cont"><div class="plain">'+plain+'<span class="date">'+window.project.formatTime(time)+'</span></div></div></div></div></div>'
    },
    sendMsgTpl : function(picUrl,plain){
        return '<div class="message me"><img src="'+picUrl+'" alt="" class="avatar"><div class="content"><div class="bubble bubble_primary right"><div class="bubble_cont"><div class="plain">'+plain+'<span class="date">'+team.getCurrentDate()+'</span></div></div></div></div></div>'
    },
    websocketTpl : function(picUrl,plain,time){
        return '<div class="message"><img src="'+picUrl+'" alt="" class="avatar"><div class="content"><div class="bubble bubble_default left"><div class="bubble_cont"><div class="plain">'+plain+'<span class="date">'+window.project.formatTime(time)+'</span></div></div></div></div></div>'
    },
    noMessageTpl: function(){
        return '<div class="noMessage">'+window.i18n('没有最新留言')+'</div>'
    },
    historyTpl : function(data){
        if (data && data.length>0) {
            var Tpl = '';
            var mePicUrl = '';
            $(data).each(function (i, va){
                mePicUrl = va.from_user.id === chat.chatConfig.rentTicketData.interested_rent_tickets[0].user.id? chat.placeholderPic.HOST: chat.placeholderPic.Tenant
                if (va.from_user.id === window.user.id) {
                    if (va.display === 'text') {
                        Tpl += chat.meMsgTpl(mePicUrl,va.message,va.time)
                    }
                }else{
                    if (va.display === 'text') {
                        Tpl += chat.defMsgTpl(mePicUrl,va.message,va.time)
                    }
                }
            })
            $('#chatContent').html(Tpl);
        }else{
            $('#chatContent').prepend(chat.noMessageTpl);
        }
    },
    chatFlashTitle: function(){
        var documentfocusState=true; //是否为当前活动页面 通过改变它来判断是否为活动页面
        var documentTit=document.title;
        var flashTitleStep = 0;
        var flashTitleTimer = null;
        $(window,document,'body').on('focus',function(){
            documentfocusState=true;
        });
        $(window).on('blur',function(){
            documentfocusState=false;
            $(document).one('click',function(){ documentfocusState=true; })
        });

        if(documentfocusState===false){
            flashTitleTimer = window.setInterval(function(){
                flashTitleStep++;
                if(flashTitleStep>=3) { flashTitleStep=1}
                if(flashTitleStep===1) {document.title='【您有新的聊天】'}
                if(flashTitleStep===2) {document.title='【　　　　　　】'}
            },400);
            $(window,document,'body').on('focus',function(){
                documentfocusState=true;
                if(flashTitleTimer) { window.clearInterval(flashTitleTimer); }
                document.title=documentTit;
            });
        }
    },
    historyMessage: function(){    
        $.betterPost('/api/1/rent_intention_ticket/'+chat.chatConfig.rent_intention_ticket_id+'/chat/history', {target_user_id: chat.target_user_id()})
            .done(function (data) {
                $('#loadIndicator').hide()
                if (team.isPhone()) {
                    chat.historyTpl(team.jsonSort(data, 'time'))
                }else{
                    chat.historyTpl(data, 'time')
                }
            })
            .fail(function (ret) {
                window.dhtmlx.message({ type: 'error', text: window.getErrorMessageFromErrorCode(ret) })
                $('#loadIndicator').hide()
            })
    },
    sendTextMessage : function(){
        var PicUrl =  window.user.id === chat.chatConfig.rentTicketData.interested_rent_tickets[0].user.id? chat.placeholderPic.HOST: chat.placeholderPic.Tenant
        
        $.betterPost('/api/1/rent_intention_ticket/'+chat.chatConfig.rent_intention_ticket_id+'/chat/send', {target_user_id: chat.target_user_id(), message: $('#edit_area').val(), time: new Date()})
            .done(function (data) {
                if ($('#chatContent .noMessage').length>0) {
                    $('#chatContent .noMessage').hide()
                }
                $('#chatContent').prepend(chat.sendMsgTpl(PicUrl,$('#edit_area').val()));
                chat.clearEditArea()
                chat.chatFlashTitle()
                //socketWs.send($('#edit_area').val())
            })
            .fail(function (ret) {
                window.dhtmlx.message({ type: 'error', text: window.getErrorMessageFromErrorCode(ret) })
            })
    },
    sendMobileTextMessage : function(){
        var PicUrl =  window.user.id === chat.chatConfig.rentTicketData.interested_rent_tickets[0].user.id? chat.placeholderPic.HOST: chat.placeholderPic.Tenant
        
        $.betterPost('/api/1/rent_intention_ticket/'+chat.chatConfig.rent_intention_ticket_id+'/chat/send', {target_user_id: chat.target_user_id(), message:$('#chat_edit_area').val()})
            .done(function (data) {
                if ($('#chatContent .noMessage').length>0) {
                    $('#chatContent .noMessage').hide()
                }
                $('#chatContent').append(chat.sendMsgTpl(PicUrl,$('#chat_edit_area').val()));
                chat.clearEditArea()
                chat.chatFlashTitle()
                //socketWs.send($('#chat_edit_area').val())
            })
            .fail(function (ret) {
                window.dhtmlx.message({ type: 'error', text: window.getErrorMessageFromErrorCode(ret) })
            })
    },
    clearEditArea : function(){
        $('#edit_area,#chat_edit_area').val('');
        $('.btn_send').attr('disabled',true)
    }
}

if (!window.wsListeners) { window.wsListeners = [] }
var listener = {};
listener.onreceivemessage = function(socketVal) {
    var PicUrl =  socketVal.from_user.id === chat.chatConfig.rentTicketData.interested_rent_tickets[0].user.id? chat.placeholderPic.HOST: chat.placeholderPic.Tenant
    if (socketVal.ticket_id === chat.chatConfig.rent_intention_ticket_id && socketVal.from_user.id === chat.target_user_id()) {
        $.betterPost('/api/1/message/'+socketVal.id+'/mark/read')
            .done(function (data) {
                chat.chatFlashTitle()
                if (team.isPhone()) {
                    $('#chatContent').append(chat.sendMsgTpl(PicUrl,socketVal.message,socketVal.time));
                }else{
                    $('#chatContent').prepend(chat.websocketTpl(PicUrl,socketVal.message,socketVal.time));
                }
            })
            .fail(function (ret) {
                window.dhtmlx.message({ type: 'error', text: window.getErrorMessageFromErrorCode(ret) })
            })
    }
}
window.wsListeners.push(listener)


$(function(){
    chat.init();
    $('#edit_area').on('keyup', function(e) {
        if($('#edit_area').val().trim().length>0){
            $('.btn_send').removeAttr('disabled')
        }else{
            $('.btn_send').attr('disabled','disabled')
        }
    });
});

;(function(){
    if($('#edit_area').val().trim().length){
        $('.btn_send').attr('disabled',' ')
    }else{
        $('.btn_send').attr('disabled','disabled')
    }    
})();


$(function(){
    var itemsPerPage = 5
    var lastItemTime
    var isLoading = false
    var isAllItemsLoaded = false

    var params = {
        'target_user_id': chat.target_user_id(),
        'per_page' : itemsPerPage,
        'time' : lastItemTime
    }
function loadChatHistoryList(reload) {

    $('.isAllLoadedInfo').hide()
    if (lastItemTime) {
        params.time = lastItemTime

    }

    if(reload){
        $('#result_list').empty()
        lastItemTime = null
        delete params.time
    }

    $('#result_list_container').show()
    $('.emptyPlaceHolder').hide();

    isLoading = true
    $('#loadIndicator').show()

    var totalResultCount = getCurrentTotalCount()

    if($('body').height() - $(window).scrollTop() - $(window).height() < 120 && totalResultCount > 0) {
        $('body,html').animate({scrollTop: $('body').height()}, 300)
    }

    

    $.betterPost('/api/1/rent_intention_ticket/'+chat.chatConfig.rent_intention_ticket_id+'/chat/history',params)
        .done(function (val) {
            var array = val
            if (!_.isEmpty(array)) {
                lastItemTime = _.last(array).time

                if (!window.ChatHistoryList) {
                    window.ChatHistoryList = []
                }
                window.ChatHistoryList = window.ChatHistoryList.concat(array)

                
                
                _.each(array, function (history) {
                    var mePicUrl = history.from_user.id === chat.chatConfig.rentTicketData.interested_rent_tickets[0].user.id? chat.placeholderPic.HOST: chat.placeholderPic.Tenant
                    if (history.user_id === window.user.id && history.status !== 'read') {
                        $.betterPost('/api/1/message/'+history.id+'/mark/read')
                            .done(function (res) {
                            })
                            .fail(function (ret) {
                            })
                    }
                    
                    var historyResult = '';
                    if (history.from_user.id === window.user.id) {
                        historyResult += chat.meMsgTpl(mePicUrl,history.message,history.time)
                    }else{
                        historyResult += chat.defMsgTpl(mePicUrl,history.message,history.time)
                    }
                    if (team.isPhone()) {
                        $('#chatContent').prepend(historyResult)
                    }else{                        
                        $('#chatContent').append(historyResult)
                    }                  


                    if (lastItemTime > history.time) {
                        lastItemTime = history.time
                    }
                })
                totalResultCount = getCurrentTotalCount()

                isAllItemsLoaded = false
            } else {
                isAllItemsLoaded = true
                //$('.isAllLoadedInfo').show()
            }
            updateResultCount(totalResultCount)

        }).fail(function (ret) {
            if(ret !== 0) {
                updateResultCount(totalResultCount)
            }
    }).always(function () {
            $('#loadIndicator').hide()
            isLoading = false
        })
}
loadChatHistoryList()

    function getCurrentTotalCount() {
        return $('#chatContent').children('.message').length
    }
    function updateResultCount(count) {
        if (count) {
            $('#chatContent').show()
            $('.emptyPlaceHolder').hide();
        } else {
            $('#chatContent').hide()
            $('.emptyPlaceHolder').show();
        }
    }

    function needLoad() {
        var scrollPos = $(window).scrollTop()
        var windowHeight = $(window).height()

        var listHeight = $('#chatContent').height()
        var requireToScrollHeight = listHeight
        return windowHeight + scrollPos > requireToScrollHeight && !isLoading && !isAllItemsLoaded
    }
    function autoLoad() {

        if(needLoad()) {
            $('.isAllLoadedInfo').hide()
            loadChatHistoryList()
        }
    }
    $(window).scroll(autoLoad)


});


