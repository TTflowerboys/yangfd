/* Created by frank on 14/10/21. */

/* jshint ignore:start */



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
    if(window.team.isPhone()) {
        window.BDBridgeConfig = {
            VERSION: "99.0.0",
            BD_BRIDGE_OPEN: 0
        }
    }
    var hm = document.createElement("script");
    hm.src = "//hm.baidu.com/hm.js?090a8d3a2b9f705eae9f19cbf63550f6";
    document.getElementsByTagName("body")[0].appendChild(hm);
})();

/* jshint ignore:end */
