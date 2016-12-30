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
        $('.btn_send').attr('disabled','disabled')
    },
    placeholderPic : {
        'HOST' : '/static/images/chat/placeholder_host.png',
        'Tenant' : '/static/images/chat/placeholder_tenant.png'
    },
    chatConfig : {
        'rentTicketData' : JSON.parse($('#rentTicketData').text()),
        'rent_intention_ticket_id' : (location.href.match(/user\-chat\/([0-9a-fA-F]{24})\/details/) || [])[1]
    },
    validate : function(valArea,sendBtn,errorType){
        var wordBlacklist = ['微信', '微博', 'QQ', '电话', 'weixin', 'wechat', 'whatsapp', 'facebook', 'weibo']
        var errorConf = {
            'empty' : window.i18n('请填写聊天信息'),
            'maxlength' : window.i18n('聊天内容超出最大限制'),
            'includePhoneOrEmail' : window.i18n('请不要在聊天中填写任何形式的联系方式'),
            'ok' : ''
        }
        var valAreaValue = valArea.val().trim()
        var valAreaLength = valAreaValue.length

        function validateShow(errorText,errorType){
            if (errorType === undefined || errorType === 'text') {
                return $('.requirementRentFormError').text(errorText)
            }else if(errorType === 'popup'){
                if (errorText) {
                    if ($('.dhtmlx_message_area').text()) {
                        return
                    }else{
                        return window.dhtmlx.message({ type: 'error', text: errorText })
                    }
                }
            }
        }   

        if(!valAreaLength) {
            validateShow(errorConf.empty,errorType)
            sendBtn.attr('disabled','disabled')
        }else if(valAreaLength > 200){
            validateShow(errorConf.maxlength,errorType)
            sendBtn.attr('disabled','disabled')
        }else if(window.project.includePhoneOrEmail(valAreaValue) || _.some(wordBlacklist, function (v) {
            return valAreaValue.toLowerCase().indexOf(v.toLowerCase()) !== -1
        })) {
            validateShow(errorConf.includePhoneOrEmail,errorType)
            sendBtn.attr('disabled','disabled')
        }else{
            validateShow(errorConf.ok,errorType)
            sendBtn.removeAttr('disabled')
        }
    },
    //TODO @tomlei the tpl for message can use one template ?
    target_user_id : function(){
        return window.user.id === chat.chatConfig.rentTicketData.interested_rent_tickets[0].user.id? chat.chatConfig.rentTicketData.creator_user.id: chat.chatConfig.rentTicketData.interested_rent_tickets[0].user.id
    },
    isSendMsg : function(){
        return $('#edit_area').val().trim().length ? true : false;
    },
    isMobileSendMsg : function(){
        return $('#chat_edit_area').val().trim().length ? true : false;
    },
    meMsgTpl : function(messageId, picUrl,plain,time){
        return '<div class="message me" data-id="' + messageId + '"><img src="'+picUrl+'" alt="" class="avatar"><div class="content"><div class="bubble bubble_primary right"><div class="bubble_cont"><div class="plain">'+plain+'<span class="date">'+window.project.formatTime(time)+'</span></div></div></div></div></div>'
    },
    defMsgTpl : function(messageId, picUrl,plain,time){
        return '<div class="message me" data-id="' + messageId + '"><img src="'+picUrl+'" alt="" class="avatar"><div class="content"><div class="bubble bubble_default left"><div class="bubble_cont"><div class="plain">'+plain+'<span class="date">'+window.project.formatTime(time)+'</span></div></div></div></div></div>'
    },
    sendMsgTpl : function(messageId, picUrl,plain){
        return '<div class="message me" data-id="' + messageId + '"><img src="'+picUrl+'" alt="" class="avatar"><div class="content"><div class="bubble bubble_primary right"><div class="bubble_cont"><div class="plain">'+plain+'<span class="date">'+team.getCurrentDate()+'</span></div></div></div></div></div>'
    },
    websocketTpl : function(messageId, picUrl,plain,time){
        return '<div class="message me" data-id="' + messageId + '"><img src="' +picUrl+'" alt="" class="avatar"><div class="content"><div class="bubble bubble_default left"><div class="bubble_cont"><div class="plain">'+plain+'<span class="date">'+window.project.formatTime(time)+'</span></div></div></div></div></div>'
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
                        Tpl += chat.meMsgTpl(va.id, mePicUrl,va.message,va.time)
                    }
                }else{
                    if (va.display === 'text') {
                        Tpl += chat.defMsgTpl(va.id, mePicUrl,va.message,va.time)
                    }
                }
            })
            $('#chatContent').html(Tpl);
        }else{
            $('#chatContent').prepend(chat.noMessageTpl);
        }
    },
    chatFlashTitle: function(){
        var documentfocusState=true;
        var documentTit=document.title;
        var flashTitleStep = 0;
        var flashTitleTimer = null;
        $(window,document,'body').on('focus',function(){
            documentfocusState=true;
        });
        $(window).on('blur',function(){
            documentfocusState=false;
            //$(document).one('click',function(){ documentfocusState=true; })
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
                $('#chatContent').prepend(chat.sendMsgTpl(_.uniqueId('local_'), PicUrl, $('#edit_area').val()));
                chat.clearEditArea()
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
                $('#chatContent').append(chat.sendMsgTpl(_.uniqueId('local_'), PicUrl, $('#chat_edit_area').val()));
                chat.clearEditArea()
                $('body').scrollTop(999999)
            })
            .fail(function (ret) {
                window.dhtmlx.message({ type: 'error', text: window.getErrorMessageFromErrorCode(ret) })
            })
            .always(function(){
                $('.btn_send').attr('disabled','disabled')
            })
    },
    clearEditArea : function(){
        $('#edit_area,#chat_edit_area').val('');
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
                    $('#chatContent').append(chat.sendMsgTpl(socketVal.id, PicUrl,socketVal.message,socketVal.time));
                }else{
                    $('#chatContent').prepend(chat.websocketTpl(socketVal.id, PicUrl,socketVal.message,socketVal.time));
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
        chat.validate($('#edit_area'),$('.btn_send'))
    });
    $('#chat_edit_area').on('keyup',function(e){
        chat.validate($('#chat_edit_area'),$('#btn_send_phone'),'popup')
    })
});


$(function(){
    var itemsPerPage = 10
    var lastItemTime
    var isLoading = false
    var isAllItemsLoaded = false

    var params = {
        'target_user_id': chat.target_user_id(),
        'per_page' : itemsPerPage,
        'time' : lastItemTime
    }

    function loadChatHistoryList(reload , callback) {

        if (lastItemTime) {
            params.time = lastItemTime
        }

    if(reload){
        $('#chatContent').empty()
        lastItemTime = null
        delete params.time
    }

    $('.emptyPlaceHolder').hide();

    isLoading = true
    $('#loadIndicator').show()

    var totalResultCount = getCurrentTotalCount()

        // if($('body').height() - $(window).scrollTop() - $(window).height() < 120 && totalResultCount > 0) {
        //     $('body,html').animate({scrollTop: $('body').height()}, 300)
        // }   
        

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
                            historyResult += chat.meMsgTpl(history.id, mePicUrl,history.message,history.time)
                        }else{
                            historyResult += chat.defMsgTpl(history.id, mePicUrl,history.message,history.time)
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
                }
                updateResultCount(totalResultCount)

                if (callback) {
                    callback()
                }
            }).fail(function (ret) {
                if(ret !== 0) {
                    updateResultCount(totalResultCount)
                }
        }).always(function () {
                $('#loadIndicator').hide()
                isLoading = false
            })
    }


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

    function needLoadForNonPhone() {
        var scrollPos = $(window).scrollTop()
        var windowHeight = $(window).height()

        var listHeight = $('#chatContent').height()
        var requireToScrollHeight = listHeight
        var needLoadSwitch = team.isPhone()? scrollPos<10 : windowHeight + scrollPos > requireToScrollHeight
        return needLoadSwitch && !isLoading && !isAllItemsLoaded
    }

    loadChatHistoryList()

    if (team.isPhone()) {
        var $indicator = $('.loadIndicator')
        var $list = $('#chatContent')
        $indicator.insertBefore($list)
        if ($list.height() < $(window).height()) {
            $list.height($(window).height())
        }

        $(window).scroll(function (e) {
            var scrollPos = $(window).scrollTop()
            if (scrollPos === 0 && !isLoading && !isAllItemsLoaded) {
                var oldFirstItem = $('#chatContent .message').first()
                var oldTop = oldFirstItem.offset().top
                loadChatHistoryList(false, function() {
                    var newTop = oldFirstItem.offset().top
                    $('body').scrollTop(50 + newTop - oldTop)
                })
            }
        })
    }
    else {
        $(window).scroll(function () {
            if(needLoadForNonPhone()) {
                loadChatHistoryList()
            }
        })
    }

});


