var chat = {
    init : function(){
        $('#btn_send').on('click',function(){
            if (chat.isSendMsg()) { chat.sendTextMessage($('#edit_area').val()) }
        })
        $('#btn_send_phone').on('click',function(){
            if (chat.isMobileSendMsg()) { chat.sendTextMessage($('#chat_edit_area').val(),'mobile') }
        })
        // $('#edit_area').on('keydown', function(e) {
        //     if(e.keyCode === team.keyCode.KEYCODE_ENTER){
        //         if (chat.isSendMsg()) { chat.sendTextMessage($('#edit_area').val()) }
        //         e.preventDefault()
        //     }
        // });
        $('.btn_send').attr('disabled','disabled')
    },
    placeholderPic : {
        'HOST' : '/static/images/chat/placeholder_host.png',
        'Tenant' : '/static/images/chat/placeholder_tenant.png'
    },
    chatConfig : {
        'rentTicketData' : JSON.parse($('#rentTicketData').text()),
        'getRentIntentionTicketId' : (location.href.match(/user\-chat\/([0-9a-fA-F]{24})\/details/) || [])[1]
    },
    validate : function(valArea, sendBtn, uiType){
        var wordBlacklist = ['微信', '微博', 'QQ', '电话', 'weixin', 'wechat', 'whatsapp', 'facebook', 'weibo']
        var errorConf = {
            'empty' : window.i18n('请填写聊天信息'),
            'maxLength' : window.i18n('聊天内容超出最大限制'),
            'blackList' : window.i18n('请不要在聊天中填写任何形式的联系方式'),
            'ok' : ''
        }
        var valAreaValue = valArea.val().trim()
        var valAreaLength = valAreaValue.length

        function displayErrorMessage(errorText){
            if (uiType === undefined || uiType === 'text') {
                return $('.requirementRentFormError').text(errorText)
            }else if(uiType === 'popup'){
                if (errorText) {
                    if ($('.dhtmlx_message_area').text()) {
                        return
                    }else{
                        return window.dhtmlx.message({ type: 'error', text: errorText })
                    }
                }
            }
        }

        if(valAreaLength > 1000){
            displayErrorMessage(errorConf.maxLength)
            sendBtn.attr('disabled', 'disabled')
        }else if(window.project.includePhoneOrEmail(valAreaValue) || _.some(wordBlacklist, function (v) {
            return valAreaValue.toLowerCase().indexOf(v.toLowerCase()) !== -1
        })) {
            displayErrorMessage(errorConf.blackList)
            sendBtn.attr('disabled', 'disabled')
        }else{
            displayErrorMessage(errorConf.ok)
            sendBtn.removeAttr('disabled')
        }
    },
    getTargetUserId : function(){
        return window.user.id === chat.chatConfig.rentTicketData.interested_rent_tickets[0].user.id? chat.chatConfig.rentTicketData.creator_user.id: chat.chatConfig.rentTicketData.interested_rent_tickets[0].user.id
    },
    isSendMsg : function(){
        return $('#edit_area').val().trim().length ? true : false;
    },
    isMobileSendMsg : function(){
        return $('#chat_edit_area').val().trim().length ? true : false;
    },
    getMessageTpl : function(messageId, picUrl, plain, role, time){
        time = time !== undefined? window.project.formatTime(time): team.getCurrentDate()
        if (role === 'me') {
            return '<div class="message me" data-id="' + messageId + '"><img src="'+picUrl+'" alt="" class="avatar"><div class="content"><div class="bubble bubble_primary right"><div class="bubble_cont"><div class="plain">'+plain+'<span class="date">'+ time +'</span></div></div></div></div></div>'
        }else if(role === 'default'){
            return '<div class="message" data-id="' + messageId + '"><img src="'+picUrl+'" alt="" class="avatar"><div class="content"><div class="bubble bubble_default left"><div class="bubble_cont"><div class="plain">'+plain+'<span class="date">'+ time +'</span></div></div></div></div></div>'
        }
    },
    flashTitle: function(){
        var documentfocusState=true;
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
    sendTextMessage : function(message,deviceType){
        var picUrl =  window.user.id === chat.chatConfig.rentTicketData.interested_rent_tickets[0].user.id? chat.placeholderPic.HOST: chat.placeholderPic.Tenant
        
        $.betterPost('/api/1/rent_intention_ticket/'+chat.chatConfig.getRentIntentionTicketId+'/chat/send', {target_user_id: chat.getTargetUserId(), message: message})
            .done(function (data) {
                if ($('#chatContent .noMessage').length>0) {
                    $('#chatContent .noMessage').hide()
                }
                if (deviceType === 'mobile') {
                    $('#chatContent').append(chat.getMessageTpl(_.uniqueId('local_'), picUrl, message,'me'));
                    $('body').scrollTop(999999)
                }else{
                    $('#chatContent').prepend(chat.getMessageTpl(_.uniqueId('local_'), picUrl, message,'me'));
                }
                if ($('.emptyPlaceHolder').is(':visible')) {
                    $('.emptyPlaceHolder').hide()
                }
                chat.clearEditArea()
                //socketWs.send($('#edit_area').val())
            })
            .fail(function (ret) {
                window.dhtmlx.message({ type: 'error', text: window.getErrorMessageFromErrorCode(ret) })
            })
    },
    clearEditArea : function(){
        $('#edit_area,#chat_edit_area').val('');
    }
}

if (!window.wsListeners) { window.wsListeners = [] }
var listener = {};
listener.onreceivemessage = function(socketVal) {
    var picUrl =  socketVal.from_user.id === chat.chatConfig.rentTicketData.interested_rent_tickets[0].user.id? chat.placeholderPic.HOST: chat.placeholderPic.Tenant
    if (socketVal.ticket_id === chat.chatConfig.getRentIntentionTicketId && socketVal.from_user.id === chat.getTargetUserId()) {
        $.betterPost('/api/1/message/'+socketVal.id+'/mark/read')
            .done(function (data) {
                chat.flashTitle()
                if (team.isPhone()) {
                    $('#chatContent').append(chat.getMessageTpl(socketVal.id, picUrl,socketVal.message,'default',socketVal.time));
                }else{
                    $('#chatContent').prepend(chat.getMessageTpl(socketVal.id, picUrl,socketVal.message,'default',socketVal.time));
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
    // pc
    $('#edit_area').on('keyup', function(e) {
        chat.validate($('#edit_area'),$('.btn_send'))
    });
    // phone
    $('#chat_edit_area').on('keyup',function(e){
        chat.validate($('#chat_edit_area'),$('#btn_send_phone'), 'popup')
    })
});


$(function(){
    var itemsPerPage = 10
    var lastItemTime
    var isLoading = false
    var isAllItemsLoaded = false

    var params = {
        'target_user_id': chat.getTargetUserId(),
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

    $.betterPost('/api/1/rent_intention_ticket/'+chat.chatConfig.getRentIntentionTicketId+'/chat/history',params)
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
                                window.dhtmlx.message({ type: 'error', text: window.getErrorMessageFromErrorCode(ret) })
                            })
                    }

                    var historyResult = '';
                    if (history.from_user.id === window.user.id) {
                        historyResult += chat.getMessageTpl(history.id, mePicUrl,history.message,'me',history.time)
                    }else{
                        historyResult += chat.getMessageTpl(history.id, mePicUrl,history.message,'default',history.time)
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
                $('.emptyPlaceHolder').hide()
            } else {
                isAllItemsLoaded = true
                $('.emptyPlaceHolder').show()
            }            
            updateResultCount(totalResultCount)
            if (callback) { callback() }

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
            $('.emptyPlaceHolder').hide();
        } else {
            if (team.isPhone()) {
                $('#chatContent').hide()
            }
            $('.emptyPlaceHolder').show()
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


