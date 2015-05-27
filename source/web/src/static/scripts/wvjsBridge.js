function connectWebViewJavascriptBridge(callback) {
    if (window.WebViewJavascriptBridge) {
        callback(window.WebViewJavascriptBridge)
    } else {
        document.addEventListener('WebViewJavascriptBridgeReady', function() {
            callback(window.WebViewJavascriptBridge)
        }, false)
    }
}

connectWebViewJavascriptBridge(function(bridge) {
    bridge.init(function(message, responseCallback) {
        //alert('Received message: ' + message)
        if (responseCallback) {
            responseCallback('Right back atcha')
        }
    })
    window.bridge = bridge
    window.bridge.callHandler('handshake', window.location)
})
