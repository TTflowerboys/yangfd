(function() {
    $('[data-fn=shareToWeChat]').on('click', function () {
        $('#popupShareToWeChat')
            .find('img').prop('src', '/qrcode/generate?content=' + encodeURIComponent(location.protocol + '//' + location.host + '/wechat-poster/' + $(this).attr('data-id'))).end()
            .modal()
        //ga('send', 'event', 'property_detail', 'share', 'open-wechat-web')
    })

    $(function() {
        $('.qrcodeBox').find('img').prop('src', '/qrcode/generate?content=' + encodeURIComponent(location.protocol + '//' + location.host + '/wechat-poster/' + $('.qrcodeBox img').attr('data-id')))
        $('#copyBtn').attr('data-clipboard-text', location.protocol + '//' + location.host + '/wechat-poster/' + $('#copyBtn').data('id'))
        var client = new window.ZeroClipboard( document.getElementById('copyBtn') )
        client.on('ready', function(readyEvent) {
            client.on('aftercopy', function(event) {
                window.alert(window.i18n('复制成功:') + event.data['text/plain'] )
            } );
        } );
    })
})()