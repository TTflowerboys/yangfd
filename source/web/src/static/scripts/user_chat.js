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
  },
  isSendMsg : function(){
    return $('#edit_area').val().trim().length ? true : false;
  },
  isMobileSendMsg : function(){
    return $('#chat_edit_area').val().trim().length ? true : false;
  },
  meMsgTpl : function(picUrl,plain){
      return '<div class="message me"><img src="'+picUrl+'" alt="" class="avatar"><div class="content"><div class="bubble bubble_primary right"><div class="bubble_cont"><div class="plain">'+plain+'</div></div></div></div></div>'
  },
  defMsgTpl : function(picUrl,plain){
    return '<div class="message"><img src="'+picUrl+'" alt="" class="avatar"><div class="content"><div class="bubble bubble_default left"><div class="bubble_cont"><div class="plain">'+plain+'</div></div></div></div></div>'
  },
  meMsgImgTpl : function(picUrl,img){
    return '<div class="message me"><img src="'+picUrl+'" alt="" class="avatar"><div class="content"><div class="bubble bubble_primary right"><div class="bubble_cont"><div class="plain"><img src="'+img+'"></div></div></div></div></div>'
  },
  sendTextMessage : function(){
    $.ajax({
      url: '/api/1/message',
      type: 'post',
      data:null,
      dataType: 'json',
      timeout: 20000,
      cache: false,
      error: function(){//出错
          window.alert('服务端出错！');
      },
      success: function(res){//成功
        $('#chatContent').prepend(chat.meMsgTpl('/static/images/chat/hostHeader.jpg',$('#edit_area').val()));
        chat.clearEditArea()
      }
    });
  },
  sendMobileTextMessage : function(){
    $.ajax({
      url: '/api/1/message',
      type: 'post',
      data:null,
      dataType: 'json',
      timeout: 20000,
      cache: false,
      error: function(){//出错
          window.alert('服务端出错！');
      },
      success: function(res){//成功
        $('#chatContent').prepend(chat.meMsgTpl('/static/images/chat/hostHeader.jpg',$('#chat_edit_area').val()));
        chat.clearEditArea()
      }
    });
  },
  clearEditArea : function(){
    $('#edit_area,#chat_edit_area').val('');
  }
}
chat.init();