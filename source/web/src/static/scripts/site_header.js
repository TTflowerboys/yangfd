;(function () {
    window.wsListeners = []
    //onreceivemessage
    if (window.user) {
        var socketUrl = 'wss://' + location.host + '/websocket'
        var socketWs = new WebSocket(socketUrl);
        socketWs.onopen = function() {
            socketWs.send('YFD');
        };
        // 当有消息时根据消息类型显示不同信息
        socketWs.onmessage = function(message) {
            var json;
            try { json = JSON.parse(message.data); } catch (e) { return; }
            if (json.type === 'chat') {
                for (var index in window.wsListeners) {
                    window.wsListeners[index].onreceivemessage(json)
                }
            }
        };
        socketWs.onclose = function() {
            window.console.log('连接关闭，定时重连');
        };
        socketWs.onerror = function(e) {
            window.console.log(e);
        };
        var listener = {};
        listener.onreceivemessage = function(socketVal) {
            document.getElementById('icon-message').style.display = 'none'
            document.getElementById('icon-message-notif').style.display = 'inline'
        }
        window.wsListeners.push(listener)
    }
})();