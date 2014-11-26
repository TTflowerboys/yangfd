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
})(window, document, 'script', '/reverse_proxy?link=http://www.google-analytics.com/analytics.js', 'ga');

ga('create', 'UA-55542465-1', 'auto');

//Enable Google User-ID feature if is existing user
if (window.user) {
    ga('set', '&uid', window.user.id) // Set the user ID using signed-in user_id.
}

ga('send', 'pageview');

// Mouse Flow
var _mfq = _mfq || [];
(function () {
    var mf = document.createElement("script");
    mf.type = "text/javascript";
    mf.async = true;
    mf.src = "//cdn.mouseflow.com/projects/cf781e50-74b4-43f3-9e9a-0a46076e63c5.js";
    document.getElementsByTagName("head")[0].appendChild(mf);
})();

/* jshint ignore:end */
