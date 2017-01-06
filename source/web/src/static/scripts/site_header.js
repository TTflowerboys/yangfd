;(function () {
    if (window.user) {

        var markMessageAsRead =  function(messageId) {
            $.betterPost('/api/1/message/' + messageId + '/mark/' + 'read')
                .done(function (data) {
                })
                .fail(function (ret) {
                })
                .always(function () {

                })
        }

        $.betterPost('/api/1/message/search', {status: 'new, send', type: 'chat', per_page: 5, user_id: window.user.id})
            .done(function (data) {
                if (data.length > 0) {
                    document.getElementById('icon-message').style.display = 'none'
                    document.getElementById('icon-message-notif').style.display = 'inline'
                    _.each(data, function(message) {
                        var result = _.template($('#headerMessageList_template').html())({message: message})
                        $('.supHeader .messageList ul').append(result)
                    })


                    $('.supHeader .messageList ul li').mouseover(function() {
                         $(this).find('.time').hide();
                         $(this).find('.close').show();

                    }).mouseout(function() {
                        $(this).find('.close').hide();
                        $(this).find('.time').show();
                    })

                    $('.supHeader .messageList ul li .close').click(function() {
                        var $item = $(this).parents('li')
                        var messageId = $item.attr('data-id')
                        $item.find('img').hide()
                        $item.animate({
                            opacity: 0.25,
                            height: 0
                        }, 200, function() {
                            $item.remove()
                        });

                        markMessageAsRead(messageId);
                    })
                }
            })
            .fail(function (ret) {
            })
            .always(function () {

            })
    }

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
                json.status = 'sent'
                $.betterPost('/api/1/message/'+json.id+'/mark/sent')
                    .done(function (data) {
                    })
                    .fail(function (ret) {
                        window.dhtmlx.message({ type: 'error', text: window.getErrorMessageFromErrorCode(ret) })
                    })
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

        var headerListener = {};
        headerListener.onreceivemessage = function(message) {
            document.getElementById('icon-message').style.display = 'none'
            document.getElementById('icon-message-notif').style.display = 'inline'

            if (window.Notification && window.Notification.permission !== 'denied') {
                window.Notification.requestPermission(function (status) {
                    var messageIcon = message.from_user && message.from_user.face? message.from_user.face: '/static/images/chat/placeholder_tenant.png'
                    var messageBody = message.from_user && message.from_user.nickname?  '[' + message.from_user.nickname + '] ' + message.message: message.message
                    var notification = new window.Notification(i18n('洋房东：收到新消息'), {
                        body: messageBody,
                        icon: messageIcon
                    });

                    notification.onclick(function () {
                        window.open('/user-chat/' + message.ticket_id +'/detail')
                    })
                })
            }
        }
        window.wsListeners.push(headerListener)


    }
})();
