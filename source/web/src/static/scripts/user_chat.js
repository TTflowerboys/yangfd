var chat = {
  init : function(){
    $('#btn_send,#btn_send_phone').on('click',function(){
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
      return '<div class="message me"><img src="'+picUrl+'" alt="" class="avatar"><div class="content"><div class="bubble bubble_primary right"><div class="bubble_cont"><div class="plain">'+plain+'</div></div></div></div></div>'
  },
  noMessageTpl: function(){
    return '<div class="noMessage">sorry,no message!</div>'
  },
  historyTpl : function(data){
    if (data.length>0) {
      var Tpl = '';
      var mePicUrl = '/static/images/chat/hostHeader.jpg'
      $(data).each(function (i, va){
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
  historyMessage: function(){
    var rent_intention_ticket_id = (location.href.match(/user\-chat\/([0-9a-fA-F]{24})\/details/) || [])[1]
    var rentTicketData = JSON.parse($('#rentTicketData').text());
    var target_user_id = window.user.id === rentTicketData.interested_rent_tickets[0].user.id? rentTicketData.creator_user.id: rentTicketData.interested_rent_tickets[0].user.id
    $.ajax({
      url: '/api/1/rent_intention_ticket/'+rent_intention_ticket_id+'/chat/history',
      type: 'post',
      data:{target_user_id: target_user_id},
      dataType: 'json',
      timeout: 20000,
      cache: false,
      error: function(){
          window.alert('服务端出错！');
      },
      success: function(res){
        $('#loadIndicator').hide()
        var data = res.val
        if (team.isPhone()) {
          chat.historyTpl(team.jsonSort(data, 'time'))
        }else{
          chat.historyTpl(data, 'time')
        }
      }
    });
  },
  sendTextMessage : function(){
    var rent_intention_ticket_id = (location.href.match(/user\-chat\/([0-9a-fA-F]{24})\/details/) || [])[1]
    var rentTicketData = JSON.parse($('#rentTicketData').text());
    var target_user_id = window.user.id === rentTicketData.interested_rent_tickets[0].user.id? rentTicketData.creator_user.id: rentTicketData.interested_rent_tickets[0].user.id
    $.ajax({
      url: '/api/1/rent_intention_ticket/'+rent_intention_ticket_id+'/chat/send',
      type: 'post',
      data:{target_user_id: target_user_id, message: $('#edit_area').val()},
      dataType: 'json',
      timeout: 20000,
      cache: false,
      error: function(){
          window.alert('服务端出错！');
      },
      success: function(res){
        if ($('#chatContent .noMessage').length>0) {
          $('#chatContent .noMessage').hide()
        }
        $('#chatContent').prepend(chat.sendMsgTpl('/static/images/chat/hostHeader.jpg',$('#edit_area').val()));
        chat.clearEditArea()
      }
    });
  },
  sendMobileTextMessage : function(){
    var rent_intention_ticket_id = (location.href.match(/user\-chat\/([0-9a-fA-F]{24})\/details/) || [])[1]
    var rentTicketData = JSON.parse($('#rentTicketData').text());
    var target_user_id = window.user.id === rentTicketData.interested_rent_tickets[0].user.id? rentTicketData.creator_user.id: rentTicketData.interested_rent_tickets[0].user.id
    $.ajax({
      url: '/api/1/rent_intention_ticket/'+rent_intention_ticket_id+'/chat/send',
      type: 'post',
      data:{target_user_id: target_user_id, message:$('#chat_edit_area').val()},
      dataType: 'json',
      timeout: 20000,
      cache: false,
      error: function(){
          window.alert('服务端出错！');
      },
      success: function(res){
        if ($('#chatContent .noMessage').length>0) {
          $('#chatContent .noMessage').hide()
        }
        $('#chatContent').append(chat.sendMsgTpl('/static/images/chat/hostHeader.jpg',$('#chat_edit_area').val()));
        chat.clearEditArea()
      }
    });
  },
  clearEditArea : function(){
    $('#edit_area,#chat_edit_area').val('');
  }
}

/*;(function poll() {
   setTimeout(function() {
       $.ajax({ url: 'http://currant-test.bbtechgroup.com:8286/polling', success: function(data) {
            window.console.log('data:'+data)
       }, dataType: 'json', complete: poll });
    }, 30000);
})();*/

$(function(){
  chat.init();
});
