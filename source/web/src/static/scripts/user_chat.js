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
    chat.historyMessage()
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
  sendMsgTpl : function(picUrl,plain,time){
      return '<div class="message me"><img src="'+picUrl+'" alt="" class="avatar"><div class="content"><div class="bubble bubble_primary right"><div class="bubble_cont"><div class="plain">'+plain+'<span class="date">'+window.project.formatTime(time)+'</span></div></div></div></div></div>'
  },
  websocketTpl : function(picUrl,plain,time){
    return '<div class="message"><img src="'+picUrl+'" alt="" class="avatar"><div class="content"><div class="bubble bubble_default left"><div class="bubble_cont"><div class="plain">'+plain+'<span class="date">'+window.project.formatTime(time)+'</span></div></div></div></div></div>'
  },
  noMessageTpl: function(){
    return '<div class="noMessage">'+window.i18n('没有最新留言')+'</div>'
  },
  historyTpl : function(data){
    if (data !== null && data.length>0) {
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
    $.betterPost('/api/1/rent_intention_ticket/'+chat.chatConfig.rent_intention_ticket_id+'/chat/history', {target_user_id: chat.target_user_id})
        .done(function (data) {
            $('#loadIndicator').hide()
            if (team.isPhone()) {
              chat.historyTpl(team.jsonSort(data.val, 'time'))
            }else{
              chat.historyTpl(data.val, 'time')
            }
        })
        .fail(function (ret) {
            window.dhtmlx.message({ type: 'error', text: window.getErrorMessageFromErrorCode(ret) })
            $('#loadIndicator').hide()
        })
  },
  sendTextMessage : function(){
    var PicUrl =  window.user.id === chat.chatConfig.rentTicketData.interested_rent_tickets[0].user.id? chat.placeholderPic.HOST: chat.placeholderPic.Tenant
    
    $.betterPost('/api/1/rent_intention_ticket/'+chat.chatConfig.rent_intention_ticket_id+'/chat/send', {target_user_id: chat.target_user_id, message: $('#edit_area').val()})
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
    
    $.betterPost('/api/1/rent_intention_ticket/'+chat.chatConfig.rent_intention_ticket_id+'/chat/send', {target_user_id: chat.target_user_id, message:$('#chat_edit_area').val()})
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


  var listener = {};
  listener.onreceivemessage = function(socketVal) {
      var rentTicketData = JSON.parse($('#rentTicketData').text());
      var PicUrl =  socketVal.from_user.id === rentTicketData.interested_rent_tickets[0].user.id? chat.placeholderPic.HOST: chat.placeholderPic.Tenant
      if (socketVal.ticket_id === chat.chatConfig.rent_intention_ticket_id && socketVal.from_user.id === chat.target_user_id) {
          $('#chatContent').prepend(chat.websocketTpl(PicUrl,socketVal.message,socketVal.time));
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