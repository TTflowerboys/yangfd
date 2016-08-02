// Google Analytics
/* jshint ignore:start */
(function (i, s, o, g, r, a, m) {
    i['GoogleAnalyticsObject'] = r;
    i[r] = i[r] || function () {
        (i[r].q = i[r].q || []).push(arguments)
    }, i[r].l = 1 * new Date();
    a = s.createElement(o),
        m = s.getElementsByTagName(o)[0];
    a.async = 1;
    a.src = g;
    m.parentNode.insertBefore(a, m)
})(window, document, 'script', 'https://www.google-analytics.com/analytics.js', 'ga');
function getGATrackingID() {
    var ua = navigator.userAgent.toLowerCase()
    var isCurrantClient = (/currant/.test(ua)) ? true : false
    return isCurrantClient? 'UA-55542465-2': (document.body.clientWidth < 768? 'UA-55542465-4': 'UA-58294435-1')
}
if(document.domain==='currant-dev.bbtechgroup.com'||document.domain==='localhost'||document.domain==='0.0.0.0'){        
    var trackingID = getGATrackingID()
    ga('create', trackingID, 'auto');
    //Enable Google User-ID feature if is existing user
    if (window.user) {
        ga('set', '&uid', window.user.id) // Set the user ID using signed-in user_id.
    }
}else {
    var trackingID = getGATrackingID()
    ga('create', trackingID, 'auto', {'allowLinker': true});

// Load the plugin.
    ga('require', 'linker');
// Define which domains to autoLink. Exclude current domain when add link.
    var domains = ['yangfd.com', 'youngfunding.co.uk', 'yangfd.cn'];
    for (var i = domains.length - 1; i >= 0; i--) {
        if (domains[i] === window.location.host) {
            domains.splice(i, 1);
            ga('linker:autoLink', domains);
        }
    }
    //Enable Google User-ID feature if is existing user
    if (window.user) {
        ga('set', '&uid', window.user.id) // Set the user ID using signed-in user_id.
    }

    ga('send', 'pageview');
}
/* jshint ignore:end */