var chat = {
  init : function(){
    $('#btn_send').on('click',function(){
      if (chat.isSendMsg()) { chat.sendTextMessage() }
    })
    $('#edit_area').on('keypress', function(e) {
      if(e.keyCode === team.keyCode.KEYCODE_ENTER){
        if (chat.isSendMsg()) { chat.sendTextMessage() }
        e.preventDefault()
      }
    });
  },
  isSendMsg : function(){
    return $('#edit_area').val().trim().length ? true : false;
  },
  meMsgTpl : function(picUrl,plain){
      return '<div class="message me"><img src="'+picUrl+'" alt="" class="avatar"><div class="content"><div class="bubble bubble_primary right"><div class="bubble_cont"><div class="plain"><pre>'+plain+'</pre></div></div></div></div></div>'
  },
  defMsgTpl : function(picUrl,plain){
    return '<div class="message"><img src="'+picUrl+'" alt="" class="avatar"><div class="content"><div class="bubble bubble_default left"><div class="bubble_cont"><div class="plain"><pre>'+plain+'</pre></div></div></div></div></div>'
  },
  meMsgImgTpl : function(picUrl,img){
    return '<div class="message me"><img src="'+picUrl+'" alt="" class="avatar"><div class="content"><div class="bubble bubble_primary right"><div class="bubble_cont"><div class="plain"><img src="'+img+'"></div></div></div></div></div>'
  },
  sendTextMessage : function(){
    $.ajax({
      url: '/api/1/rent_ticket/search?_i18n=disabled&per_page=10',
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
  clearEditArea : function(){
    $('#edit_area').val('');
  }
}
chat.init();