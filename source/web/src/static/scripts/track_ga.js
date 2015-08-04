// Google Analytics
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
})(window, document, 'script', 'http://www.google-analytics.com/analytics.js', 'ga');
if(document.domain==='currant-dev.bbtechgroup.com'||document.domain==='localhost'||document.domain==='0.0.0.0'){
    ga('create', 'UA-58294435-1', 'auto');
    //Enable Google User-ID feature if is existing user
    if (window.user) {
        ga('set', '&uid', window.user.id) // Set the user ID using signed-in user_id.
    }
}else {
    ga('create', 'UA-55542465-1', 'auto', {'allowLinker': true});

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