/*(function () {

 if (window.user) {
 $.betterPost('/api/1/message', {'status': 'new'})
 .done(function (data) {
 if (data.length > 0) {
 document.getElementById('icon-message').style.display = 'none'
 document.getElementById('icon-message-notif').style.display = 'inline'
 }
 })
 .fail(function (ret) {
 })
 .always(function () {

 })


 //GA
 $('.message').on('click', function() {
 ga('send', 'event', 'header', 'click', 'setting-entry');
 });

 $('.nickname').on('click', function() {
 ga('send', 'event', 'header', 'click', 'message-entry');
 });

 $('.logout').on('click', function() {
 ga('send', 'event', 'header', 'click', 'logout');
 });
 }

 })()*/

/*;(function poll() {
    if (window.user) {
        $.ajax({
            url: '/polling',
            data: {type: 'chat'},
            dataType: 'json',
            cache: false,
            success: function(data) {
                if (data.type !== 'keep-alive') {
                    window.console.log('ok! [From: polling.]')
                }else{
                    window.console.log('waiting...')
                }
            },
            error: function(ret){
                //window.dhtmlx.message({ type: 'error', text: window.getErrorMessageFromErrorCode(ret) })
            },                 
            complete: poll
        });
    }
})()*/

/*{
    "message": "hi",
    "status": "new",
    "type": "chat",
    "id": "5862082b571cd906eff24788",
    "display": "text",
    "ticket_id": "5860c700571cd900dc56d1b0",
    "time": 1482819627.62,
    "from_user": {
        "nickname": "threetowns",
        "id": "5860c19e571cd904a468563e"
    }
}*/

;(function () {
    window.wsListeners = []
    //onreceivemessage
    if (window.user) {
        var socketUrl = 'wss://' + location.host + '/websocket'
        // 创建websocket
        var socketWs = new WebSocket(socketUrl);
        // 当socket连接打开时，输入用户名
        socketWs.onopen = function() {
            socketWs.send('');  // Sends a message.
        };
        // 当有消息时根据消息类型显示不同信息
        socketWs.onmessage = function(e) {
            var val = JSON.parse(e);
            var data = val.data;
            var type = data.type;
            var type2 = JSON.parse(e.data).type;
            window.console.log('socketWs.data:'+e.data+',  socketWs.type: '+ JSON.parse(e.data).type+'type:'+type+'type2:'+type2)
            //if (e.data.type !== undefined && e.data.type === 'chat') {
                for (var index in window.wsListeners) {
                    window.wsListeners[index].onreceivemessage(e)
                }
            //}
        };
        socketWs.onclose = function() {
            window.console.log('连接关闭，定时重连');
        };
        socketWs.onerror = function(e) {
            window.console.log(e);
        };
    }
})();