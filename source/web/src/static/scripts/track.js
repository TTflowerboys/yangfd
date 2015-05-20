/* Created by frank on 14/10/21. */

/* jshint ignore:start */

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



// Set up Mouse Flow
var _mfq = _mfq || [];
(function () {
    var mf = document.createElement("script");
    mf.type = "text/javascript";
    mf.async = true;

    if(window.location.host === 'yangfd.com'){
        mf.src = "//cdn.mouseflow.com/projects/719ffad3-9377-4ee5-88b7-5ec0900f18bb.js";
    }else if(window.location.host === 'youngfunding.co.uk'){
        mf.src = "//cdn.mouseflow.com/projects/cf781e50-74b4-43f3-9e9a-0a46076e63c5.js";
    }else if(window.location.host === 'yangfd.cn'){
        mf.src = "//cdn.mouseflow.com/projects/10e0e312-30d7-487c-813a-1d95a574d0aa.js";
    }

    document.getElementsByTagName("body")[0].appendChild(mf);
})();

// Set up baidu analytics
var _hmt = _hmt || [];
(function() {
    var hm = document.createElement("script");
    hm.src = "//hm.baidu.com/hm.js?090a8d3a2b9f705eae9f19cbf63550f6";
    document.getElementsByTagName("body")[0].appendChild(hm);
})();

/* jshint ignore:end */
