(function () {
    function shareSuccessCallback () {
        $('[data-shared=false]').hide()
        $('[data-shared=true]').show()
    }
    $('.shareBtn').on('click', function () {
        if(window.bridge) {
            window.bridge.callHandler('share', {'text': window.i18n('分享文案'), 'url': 'http://yangfd.com/app-download', 'services': ['Wechat Circle']}, function(response) {
                if (response.msg === 'ok') {
                   return shareSuccessCallback()
                }
                //todo App中取消分享或者分享失败
            })
        }
    })
})()