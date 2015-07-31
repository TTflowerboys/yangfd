/** #7201 在mobile app中如果js bridge的js没载出来的时候，点击有js bridge的按钮会造成问题
 *  需要在所有有bridge的按钮上添加 data-need-bridge 属性
**/
document.body.addEventListener('click', function (event) {
    if (window.team.isCurrantClient() && !window.bridge && event.target.hasAttribute('data-need-bridge')) {
        event.preventDefault()
        event.stopPropagation()
        window.console.log('Forbidden click before window.bridge is available.')
        return false
    }
}, true)

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
